package de.turtle.extern;

import com.sun.jna.Library;
import com.sun.jna.Native;
import com.sun.jna.Structure;

public interface FisLib extends Library {

    @Structure.FieldOrder({"size", "type", "entropy", "tlsh_hash", "flagged", "last_used_days"})
    class FIS_ExtFileInfo extends Structure {
        public long size;
        public byte[] type = new byte[64];
        public double entropy;
        public byte[] tlsh_hash = new byte[256];
        public int flagged;
        public int last_used_days;
    }

    int fis_compress(String path, int compLvl);
    int fis_decompress(String path);
    int fis_encrypt(String path, String password, int iter);
    int fis_decrypt(String path, String password, int iter);
    int fis_dupes_existing_for_file(String path, String filePath);
    double fis_entropy_for_file(String path);
    int fis_analyze_extended(String path, FIS_ExtFileInfo info);
    int fis_file_check_flag_bytes(byte[] bytes, long size, String expected_type);

    static FisLib load() {
        NativeLoader.loadWithJna("FISext");
        return Native.load("FISext", FisLib.class);
    }
}