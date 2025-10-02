package de.turtle.pi_cloud.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import de.turtle.pi_cloud.models.FileEntity;
import de.turtle.pi_cloud.services.CloudService;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*") //ONLY FOR TESTING, RESTRICT IN PRODUCTION
public class CloudController {
    @Autowired
    private CloudService cloudService;

    @PostMapping("/upload")
    public ResponseEntity<List<FileEntity>> uploadFile(@RequestParam("files") MultipartFile[] files) throws IOException {
        if(files.length == 1) {
            return ResponseEntity.ok(List.of(cloudService.storeFile(files[0])));
        }
        List<FileEntity> savedFiles = cloudService.storeFiles(files);
        return ResponseEntity.ok(savedFiles);
    }

    @PostMapping("/encryption/{id}")
    public ResponseEntity<String> enDeCryptFile(@PathVariable Long id, @RequestBody String password) throws IOException {
        System.out.println("Password received: " + password + " File ID: " + id);
        if(cloudService.enDeCryptFile(id, password)) {
            return ResponseEntity.ok("Success");
        }
        return ResponseEntity.noContent().build();
    }
    

    @GetMapping("/delete/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) throws IOException {
        cloudService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) throws IOException {
        FileEntity entity = cloudService.fileEntityRepository.findById(id).orElseThrow();
        byte[] data = cloudService.downloadFile(id);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + entity.getName())
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(data);
    }

    @GetMapping("/list")
    public ResponseEntity<FileEntity[]> listFiles() {
        FileEntity[] files = cloudService.listFiles();
        return ResponseEntity.ok(files);
    }
}
