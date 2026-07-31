package arrays;

import static java.lang.System.out;

public class NeedleHaystack {
    public static int strStr(String haystack, String needle) {
        if (needle == null || needle.length() == 0 || haystack == null || haystack.length() == 0 || haystack.length() < needle.length()) {
            return -1;
        }
        if (haystack.startsWith(needle)) {
            return 0;
        }
        for (int i = 1; i < haystack.length(); ++i) {
            String newStack = haystack.substring(i);
            if (newStack.startsWith(needle)) {
                return i;
            }
        }
        return -1;
    }

    static void main(String[] args){
        int result = strStr("happybuthappy", "happy");
        out.println(result);
    }
}
