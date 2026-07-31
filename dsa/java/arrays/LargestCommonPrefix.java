package arrays;

public class LargestCommonPrefix {

    private static int minLength(String[] strs) {
        int length = Integer.MAX_VALUE;
        for (int i = 0; i < strs.length; ++i) {
            if (strs[i].length() < length) {
                length = strs[i].length();
            }
        }
        return length;
    }

    private static boolean isIthCharacterSame(char c, int i, String[] strs) {
        boolean isSame = true;
        for (int j = 1; j < strs.length; ++j) {
            if (strs[j].charAt(i) != c) {
                isSame = false;
                break;
            }
        }
        return isSame;
    }

    public static String longestCommonPrefix(String[] strs) {
        int minLength = minLength(strs);
        boolean result = true;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < minLength && result; ++i) {
            char c = strs[0].charAt(i);
            boolean ithMatch = isIthCharacterSame(c, i, strs);
            if (ithMatch) sb.append(c);
            result = ithMatch;
        }
        return sb.toString();
    }

    static void main(String[] args) {
        String[] inputStrings = {"flower","flow","flight"};
        String result = longestCommonPrefix(inputStrings);
        System.out.println(result);
    }
}
