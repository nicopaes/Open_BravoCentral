
using Newtonsoft.Json;

namespace BravoCentral.Data
{
    public class Stats
    {
        [JsonProperty("additions")]
        public int Additions { get; set; }

        [JsonProperty("deletions")]
        public int Deletions { get; set; }

        [JsonProperty("total")]
        public int Total { get; set; }
        public bool BigTotal
        {
            get
            {
                return Total >= 10000;
            }
        }
    }
}