package com.oncf.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DelayRequest {
    private int minutesRetard;
    private String raison;
}
