package arrays;

import java.util.Arrays;

import static java.lang.System.out;

public class PlusOne {
    private static int[] plusOne(int[] number) {
        int[] result = new int[number.length + 1];
        boolean carry = false;
        int val = number[number.length - 1];
        if (val < 9) {
            number[number.length - 1] = val+1;
            return number;
        } else {
            System.arraycopy(number, 0, result, 1, number.length - 1);
            result[result.length - 1] = 0;
            carry = true;
        }
        int i = number.length - 2;
        while (carry && i>=0) {
            val = number[i];
            if (val < 9) {
                result[i+1] = val+1;
                carry = false;
            } else {
                result[i+1] = 0;
            }
            i--;
        }
        if (carry) {
            result[0] = 1;
            return result;
        }
        return Arrays.copyOfRange(result,1, result.length);
    }

    static void main() {
        int[] num = { 9, 9, 9};
        int[] result = plusOne(num);
        for (int n: result) {
            out.println(n);
        }
    }
}
