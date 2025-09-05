import org.json.JSONObject;
import java.math.BigInteger;
import java.util.*;

public class SecretFinderDebug {

    static BigInteger toDecimal(String value, int base) {
        return new BigInteger(value, base);
    }

    static BigInteger lagrangeAtZero(List<int[]> subset) {
        BigInteger result = BigInteger.ZERO;

        for (int i = 0; i < subset.size(); i++) {
            int xi = subset.get(i)[0];
            BigInteger yi = BigInteger.valueOf(subset.get(i)[1]);

            double numerator = 1, denominator = 1;
            for (int j = 0; j < subset.size(); j++) {
                if (i != j) {
                    int xj = subset.get(j)[0];
                    numerator *= (0 - xj);
                    denominator *= (xi - xj);
                }
            }

            double term = yi.doubleValue() * (numerator / denominator);
            result = result.add(BigInteger.valueOf(Math.round(term)));
        }

        return result;
    }

    static List<List<int[]>> generateSubsets(List<int[]> shares, int k) {
        List<List<int[]>> subsets = new ArrayList<>();
        generate(shares, k, 0, new ArrayList<>(), subsets);
        return subsets;
    }

    static void generate(List<int[]> shares, int k, int index, List<int[]> current, List<List<int[]>> subsets) {
        if (current.size() == k) {
            subsets.add(new ArrayList<>(current));
            return;
        }
        if (index >= shares.size()) return;

        current.add(shares.get(index));
        generate(shares, k, index + 1, current, subsets);
        current.remove(current.size() - 1);
        generate(shares, k, index + 1, current, subsets);
    }

    public static void main(String[] args) {
        String jsonInput = """
        {
          "keys": { "n": 4, "k": 3 },
          "1": { "base": "10", "value": "4" },
          "2": { "base": "2",  "value": "111" },
          "3": { "base": "10", "value": "12" },
          "6": { "base": "4",  "value": "213" }
        }
        """;

        JSONObject obj = new JSONObject(jsonInput);
        JSONObject keys = obj.getJSONObject("keys");
        int n = keys.getInt("n");
        int k = keys.getInt("k");

        // Decode shares
        List<int[]> shares = new ArrayList<>();
        System.out.println("🔎 Decoding shares:");
        for (String key : obj.keySet()) {
            if (!key.equals("keys")) {
                int x = Integer.parseInt(key);
                JSONObject entry = obj.getJSONObject(key);
                int base = Integer.parseInt(entry.getString("base"));
                String value = entry.getString("value");
                BigInteger y = toDecimal(value, base);
                shares.add(new int[]{x, y.intValue()});
                System.out.println("  (x=" + x + ", y=" + y + ")");
            }
        }

        // Generate subsets and calculate secrets
        System.out.println("\n🔎 Evaluating subsets of size " + k + ":");
        List<List<int[]>> subsets = generateSubsets(shares, k);
        Map<BigInteger, Integer> frequency = new HashMap<>();

        for (List<int[]> subset : subsets) {
            BigInteger secret = lagrangeAtZero(subset);
            frequency.put(secret, frequency.getOrDefault(secret, 0) + 1);

            System.out.print("  Subset { ");
            for (int[] s : subset) {
                System.out.print("(" + s[0] + "," + s[1] + ") ");
            }
            System.out.println("} → Secret = " + secret);
        }

        // Majority vote
        BigInteger correctSecret = Collections.max(frequency.entrySet(), Map.Entry.comparingByValue()).getKey();
        System.out.println("\n✅ Correct Secret (majority vote) = " + correctSecret);

        // Detect wrong shares
        System.out.println("\n⚠️ Checking for wrong shares...");
        Set<Integer> wrongShares = new HashSet<>();
        for (int[] share : shares) {
            List<int[]> temp = new ArrayList<>(shares);
            temp.remove(share);

            List<List<int[]>> subSubsets = generateSubsets(temp, k);
            Map<BigInteger, Integer> freqCheck = new HashMap<>();

            for (List<int[]> sub : subSubsets) {
                BigInteger sec = lagrangeAtZero(sub);
                freqCheck.put(sec, freqCheck.getOrDefault(sec, 0) + 1);
            }

            BigInteger mostCommon = Collections.max(freqCheck.entrySet(), Map.Entry.comparingByValue()).getKey();
            if (!mostCommon.equals(correctSecret)) {
                wrongShares.add(share[0]);
            }
        }

        System.out.println("❌ Wrong Shares = " + wrongShares);
    }
}
