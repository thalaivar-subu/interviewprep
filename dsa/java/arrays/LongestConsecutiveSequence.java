package arrays;

import java.util.Iterator;
import java.util.Set;
import java.util.TreeSet;

import static java.lang.System.out;

public class LongestConsecutiveSequence {
    public static int longestConsecutive(int[] nums) {
        if (nums.length == 0) {
            return 0;
        }
        if (nums.length == 1) {
            return 1;
        }
        Set<Integer> sortedSet = new TreeSet<>();
        for (int num: nums) {
            sortedSet.add(num);
        }
        Iterator<Integer> itr = sortedSet.iterator();
        int num = itr.next();
        int currentStreak = 1;
        int maxStreak = 1;
        while(itr.hasNext()) {
            int currNum = itr.next();
            if (num+1 == currNum) {
                currentStreak++;
                if (currentStreak > maxStreak) {
                    maxStreak = currentStreak;
                }
            } else {
                currentStreak = 1;
            }
            num = currNum;
        }
        return maxStreak;
    }

    static void main(String[] args) {
        int[] nums = { 100, 4, 200, 1, 3, 2 };
        int result = longestConsecutive(nums);
        out.println(result);
    }
}
