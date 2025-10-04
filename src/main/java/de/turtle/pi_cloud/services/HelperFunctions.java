package de.turtle.pi_cloud.services;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

public class HelperFunctions {
    public static boolean fileAtPathIsSafeToModify(String storagePathStr, Path filePath) {
        try {
            Path storage = Paths.get(storagePathStr).toRealPath();      
            Path target  = filePath.toRealPath();                        //follows sys links

            if (!target.startsWith(storage)) return false;

            if (!java.nio.file.Files.exists(target)) return false;
            if (!java.nio.file.Files.isRegularFile(target)) return false;

            if (java.nio.file.Files.isSymbolicLink(filePath)) return false;

            return true;
        } catch (IOException e) {
            return false;
        }
    }

}
