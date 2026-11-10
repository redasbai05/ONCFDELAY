import argparse
from pathlib import Path
import sqlite3
import bcrypt
from datetime import datetime, date, time, timedelta

parser = argparse.ArgumentParser(description="Reset a local ONCF Delay demo database with fictional data.")
parser.add_argument("--db", type=Path, default=Path(__file__).resolve().parent / "oncf-backend" / "oncf.db")
parser.add_argument("--reset-demo-data", action="store_true", help="Confirm replacement of local demonstration records")
args = parser.parse_args()
if not args.reset_demo_data:
    parser.error("This script replaces records. Pass --reset-demo-data only for a disposable local demo database.")
if not args.db.is_file():
    parser.error("Database not found. Start the backend once to create its schema, then stop it before seeding.")
DB = str(args.db)
PWD = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode()

conn = sqlite3.connect(DB)
cur = conn.cursor()

# Enable foreign keys & set date format for SQLite
cur.execute("PRAGMA foreign_keys = OFF")

# Already have an agent seeded? Find its ID
cur.execute("SELECT id FROM agents LIMIT 1")
agent_row = cur.fetchone()
if agent_row:
    print(f"Agent found: id={agent_row[0]}")
else:
    print("ERROR: No agent found. Run the backend first to seed the agent.")
    conn.close()
    exit(1)

# --- TRAINS ---
cur.execute("DELETE FROM trains")
cur.execute("INSERT INTO trains (capacite, etat, numero_train) VALUES (?, ?, ?)", (120, "A_L_HEURE", "T120"))
cur.execute("INSERT INTO trains (capacite, etat, numero_train) VALUES (?, ?, ?)", (60, "A_L_HEURE", "T060"))
cur.execute("INSERT INTO trains (capacite, etat, numero_train) VALUES (?, ?, ?)", (80, "A_L_HEURE", "T080"))
conn.commit()
print("✓ Trains created (T120, T060, T080)")

# Get train IDs
cur.execute("SELECT id FROM trains")
train_ids = [row[0] for row in cur.fetchall()]
t120, t060, t080 = train_ids

# --- VOYAGES ---
today = date.today()
tomorrow = today + timedelta(days=1)
day2 = today + timedelta(days=2)

def fmt_date(d):
    """ISO date string (our converter stores LocalDate as TEXT in ISO format)"""
    return d.isoformat()

cur.execute("DELETE FROM liste_attente")
cur.execute("DELETE FROM reservations")
cur.execute("DELETE FROM notifications")
cur.execute("DELETE FROM places")
cur.execute("DELETE FROM voyages")
cur.execute("DELETE FROM voyageurs")

voyages_data = [
    (fmt_date(today), "Casa-Voyageurs", "Rabat-Agdal", "08:00:00", "09:30:00", 0, t120),
    (fmt_date(today), "Casa-Voyageurs", "Fès", "10:00:00", "12:30:00", 0, t060),
    (fmt_date(tomorrow), "Rabat-Agdal", "Casa-Voyageurs", "14:00:00", "15:30:00", 0, t120),
    (fmt_date(today), "Casa-Voyageurs", "Marrakech", "06:00:00", "09:00:00", 15, t080),
]

for d, dep, arr, hdep, harr, retard, tid in voyages_data:
    cur.execute("""
        INSERT INTO voyages (date_depart, gare_arrivee, gare_depart, heure_arrivee, heure_depart, minutes_retard, train_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (d, arr, dep, harr, hdep, retard, tid))
conn.commit()
print("✓ 4 voyages created")

# Get voyage IDs
cur.execute("SELECT id FROM voyages")
voyage_ids = [row[0] for row in cur.fetchall()]
v_full, v_normal, v_future, v_delayed = voyage_ids

# --- generate places for each voyage ---
# T120 capacity = 120 → 30 rows × 4 cols
for row in range(1, 31):
    for letter in ["A", "B", "C", "D"]:
        cur.execute("INSERT INTO places (est_libre, numero_place, voyage_id) VALUES (1, ?, ?)",
                    (f"{row}{letter}", v_full))
# 60 places for voyage 2 (T060)
for row in range(1, 16):
    for letter in ["A", "B", "C", "D"]:
        cur.execute("INSERT INTO places (est_libre, numero_place, voyage_id) VALUES (1, ?, ?)",
                    (f"{row}{letter}", v_normal))
# 120 places for voyage 3 (T120)
for row in range(1, 31):
    for letter in ["A", "B", "C", "D"]:
        cur.execute("INSERT INTO places (est_libre, numero_place, voyage_id) VALUES (1, ?, ?)",
                    (f"{row}{letter}", v_future))
# 80 places for voyage 4 (T080 = 80 seats → 20 rows × 4)
for row in range(1, 21):
    for letter in ["A", "B", "C", "D"]:
        cur.execute("INSERT INTO places (est_libre, numero_place, voyage_id) VALUES (1, ?, ?)",
                    (f"{row}{letter}", v_delayed))
conn.commit()
print("✓ Places generated")

# --- VOYAGEURS ---
print("Creating 125 voyageurs...")
for i in range(1, 126):
    email = f"user{i:03d}@example.com"
    cur.execute("""
        INSERT INTO voyageurs (email, nom, password, prenom, telephone)
        VALUES (?, ?, ?, ?, ?)
    """, (email, f"Nom{i}", PWD, f"Prenom{i}", "0000000000"))
conn.commit()
print("✓ 125 voyageurs created (password123)")

# Get all voyageur IDs
cur.execute("SELECT id FROM voyageurs")
voyageur_ids = [row[0] for row in cur.fetchall()]

# --- FILL ALL 120 SEATS of voyage 1 ---
cur.execute("SELECT id FROM places WHERE voyage_id = ? ORDER BY id", (v_full,))
place_ids = [row[0] for row in cur.fetchall()]

print("Filling all 120 seats of Voyage 1...")
# Use epoch ms to match Hibernate's LocalDateTime storage format
now_ms = int(datetime.now().timestamp() * 1000)
for vid, pid in zip(voyageur_ids[:120], place_ids):
    cur.execute("UPDATE places SET est_libre = 0 WHERE id = ?", (pid,))
    cur.execute("""
        INSERT INTO reservations (date_reservation, statut, place_id, voyage_id, voyageur_id)
        VALUES (?, ?, ?, ?, ?)
    """, (now_ms, "CONFIRMEE", pid, v_full, vid))
conn.commit()
print("✓ Voyage 1: 120/120 seats occupied (FULL)")

# --- WAITING LIST for Voyage 1 (per-voyage, not per-place) ---
# 5 users go into the global FIFO queue for Voyage 1
for pos, vid in enumerate(voyageur_ids[120:125], 1):
    cur.execute("""
        INSERT INTO liste_attente (position, request_time, statut, voyage_id, voyageur_id)
        VALUES (?, ?, ?, ?, ?)
    """, (pos, now_ms, "EN_ATTENTE", v_full, vid))
conn.commit()
print("✓ Waiting list: 5 people in queue for Voyage 1 (per-voyage FIFO)")

# --- Some reservations on other voyages ---
# Voyage 2: book 10 seats
cur.execute("SELECT id FROM places WHERE voyage_id = ? AND est_libre = 1 LIMIT 10", (v_normal,))
places_normal = [row[0] for row in cur.fetchall()]
for i, pid in enumerate(places_normal):
    cur.execute("UPDATE places SET est_libre = 0 WHERE id = ?", (pid,))
    cur.execute("""
        INSERT INTO reservations (date_reservation, statut, place_id, voyage_id, voyageur_id)
        VALUES (?, ?, ?, ?, ?)
    """, (now_ms, "CONFIRMEE", pid, v_normal, voyageur_ids[i]))

# Voyage 4 (delayed): book 5 seats
cur.execute("SELECT id FROM places WHERE voyage_id = ? AND est_libre = 1 LIMIT 5", (v_delayed,))
places_delayed = [row[0] for row in cur.fetchall()]
for i, pid in enumerate(places_delayed):
    cur.execute("UPDATE places SET est_libre = 0 WHERE id = ?", (pid,))
    cur.execute("""
        INSERT INTO reservations (date_reservation, statut, place_id, voyage_id, voyageur_id)
        VALUES (?, ?, ?, ?, ?)
    """, (now_ms, "CONFIRMEE", pid, v_delayed, voyageur_ids[i + 10]))

conn.commit()
print("✓ Other voyages: reserved seats")

conn.close()
print("\n✅ SEED COMPLETE!")
print(f"   Voyage 1 (id={v_full}): FULL — 120/120 seats, 5 waiting")
print(f"   Voyage 2 (id={v_normal}): 10/60 seats taken")
print(f"   Voyage 3 (id={v_future}): 0/120 seats taken (future date)")
print(f"   Voyage 4 (id={v_delayed}): 5/80 taken, 15 min delay")
print(f"   Agent: agent@oncf.ma / admin123")
print(f"   Voyageurs: user001@example.com ... user125@example.com / password123")
