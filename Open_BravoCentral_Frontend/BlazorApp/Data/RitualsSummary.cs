using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace BravoCentral.Data
{
    public class RitualsSummary
    {
        public RitualsSummary(string name, int countDaily, int countReport, int sumRituals)
        {
            Name = name;
            CountDaily = countDaily;
            CountReport = countReport;
            SumRituals = sumRituals;
        }

        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("countDaily")]
        public int CountDaily { get; set; }
        [JsonProperty("countReport")]
        public int CountReport { get; set; }
        [JsonProperty("sumRituals")]
        public int SumRituals { get; set; }
    }
}