package arrays;

import java.util.PriorityQueue;
import java.util.Queue;

import static java.lang.System.out;

public class MoveZeros {

    private static void moveZeros(int[] arr) {
        Queue<Integer> queue = new PriorityQueue<>();
        for (int i = 0; i < arr.length; ++i) {
            if (arr[i] == 0) {
                queue.add(i);
            } else if (!queue.isEmpty()){
                int index = queue.poll();
                arr[index] = arr[i];
                arr[i] = 0;
                queue.add(i);
            }
        }
    }

    static void main(String[] args) {
        int[] input = {0,1,0,3,12,0};
        moveZeros(input);
        for (int n: input) {
            out.println(n);
        }
    }
}
