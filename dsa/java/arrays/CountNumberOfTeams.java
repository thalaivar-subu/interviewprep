package arrays;

public class CountNumberOfTeams {

    public static int numTeams(int[] rating) {
        int n = rating.length;
        int total = 0;
        for (int i = 1; i < n; ++i) {
            int ls = 0;
            int lg = 0;
            int rs = 0;
            int rg = 0;
            for (int j = 0; j < i; ++j) {
                if (rating[j] < rating[i]) ls++;
                else lg++;
            }
            for (int j = i + 1; j < n; ++j) {
                if (rating[j] > rating[i]) rg++;
                else rs++;
            }
            total += (ls * rg) + (lg * rs);
        }
        return total;
    }


    static void main(String[] args) {
        int teams = numTeams(new int[]{2,5,3,4,1});
        System.out.println(teams);
    }
}
