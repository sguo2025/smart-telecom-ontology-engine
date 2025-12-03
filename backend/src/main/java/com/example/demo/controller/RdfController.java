package com.example.demo.controller;

import com.example.demo.service.RdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rdf")
public class RdfController {
    @Autowired
    private RdfService rdfService;

    // POST Turtle text to import into Neo4j
    @PostMapping(value = "/import", consumes = "text/turtle")
    public ResponseEntity<String> importTurtle(@RequestBody String turtle) {
        try {
            rdfService.importTurtle(turtle);
            return ResponseEntity.ok("Imported");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // Also accept plain text body with turtle
    @PostMapping(value = "/import-text", consumes = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> importTurtleText(@RequestBody String turtle) {
        return importTurtle(turtle);
    }

    // GET export as turtle
    @GetMapping(value = "/export", produces = "text/turtle")
    public ResponseEntity<String> exportTurtle() {
        try {
            String turtle = rdfService.exportToTurtle();
            return ResponseEntity.ok().contentType(MediaType.valueOf("text/turtle")).body(turtle);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
