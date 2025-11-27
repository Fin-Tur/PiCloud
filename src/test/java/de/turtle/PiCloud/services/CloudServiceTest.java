package de.turtle.PiCloud.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import de.turtle.extern.FisLib;
import de.turtle.models.FileEntity;
import de.turtle.models.FileEntityRepository;
import de.turtle.models.User;
import de.turtle.models.UserRepository;
import de.turtle.services.CloudService;

@DisplayName("CloudService Test")
class CloudServiceTest {

    @Mock
    protected FileEntityRepository repo;

    @Mock 
    protected FisLib fisLib;

    @Mock
    protected UserRepository userRepo;

    @InjectMocks
    protected CloudService cloudService;

    @TempDir
    Path tempDir;

    protected User testUser;

    @BeforeEach
    void setUp(){
        MockitoAnnotations.openMocks(this);

        ReflectionTestUtils.setField(cloudService, "storagePath", tempDir.toString());
        ReflectionTestUtils.setField(cloudService, "forbiddenTypes", List.of("exe", "bat", "dll", "zip"));
        ReflectionTestUtils.setField(cloudService, "compressionEntropyThreshold", 5);
        ReflectionTestUtils.setField(cloudService, "compressionLevel", 10);
        ReflectionTestUtils.setField(cloudService, "encryptionIterations", 10000);
        ReflectionTestUtils.setField(cloudService, "maxFileSize", 10000);

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        when(userRepo.findById(1L)).thenReturn(Optional.of(testUser));

    }


    //Helper Methods

    protected byte[] createMockPNGBytes(){
        return new byte[]{
            (byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 'I', 'H', 'D', 'R'};
    }

    protected FileEntity createTestFileEntity(boolean encrypted, boolean compressed) {
        FileEntity entity = new FileEntity();
        entity.setId(1L);
        entity.setName("test.txt");
        entity.setSize(1024L);
        entity.setEncrypted(encrypted);
        entity.setCompressed(compressed);
        entity.setOwner(testUser);
        return entity;
    }

    protected Path createTestFile(String name, String content) throws IOException {
        Path file = tempDir.resolve(name);
        Files.writeString(file, content);
        return file;
    }


}
