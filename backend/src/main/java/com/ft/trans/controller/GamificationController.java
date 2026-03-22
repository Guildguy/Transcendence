//end-point(http)
package com.ft.trans.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ft.trans.controller.dto.GamificationEventRequest;
import com.ft.trans.service.GamificationService;

@RestController
@RequestMapping("/gamification")
public class GamificationController
{
    private final GamificationService gamificationService;

    public GamificationController(GamificationService gamificationService)
    {
        this.gamificationService = gamificationService;
    }

    @PostMapping("/events")
    public ResponseEntity<?> processEvent(@RequestBody GamificationEventRequest request)
    {
        GamificationService.EventResult result = gamificationService.processEvent(request);

        if (!result.success())
        {
            String message = result.message();

            if (message != null && message.toLowerCase().contains("usuario nao encontrado"))
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(message);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
        }
        return ResponseEntity.ok(result.response());
    }

    @GetMapping("/users/{userId}/summary")
    public ResponseEntity<?> summary(@PathVariable("userId") Long userId)
    {
        GamificationService.SummaryResult result = gamificationService.getSummary(userId);

        if (!result.success())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result.message());

        return ResponseEntity.ok(result.response());
    }
}
