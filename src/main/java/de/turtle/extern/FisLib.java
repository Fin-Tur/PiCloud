package de.turtle.extern;

import com.sun.jna.Library;
import com.sun.jna.Native;

public interface FisLib extends Library {

    int fis_compress(String path, int compLvl);
    int fis_decompress(String path);
    int fis_encrypt(String path, String password, int iter);
    int fis_decrypt(String path, String password, int iter);
    int fis_dupes_existing_for_file(String path, String filePath);
    double fis_entropy_for_file(String path);

    static FisLib load() {
        NativeLoader.loadWithJna("FISext");
        return Native.load("FISext", FisLib.class);
    }
}