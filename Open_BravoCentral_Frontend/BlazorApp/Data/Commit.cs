using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace BravoCentral.Data
{
    public class Commit
    {
        [JsonProperty("_id")]
        public string _Id { get; set; }
        [JsonProperty("short_id")]
        public string ShortId { get; set; }

        [JsonProperty("title")]
        public string Title { get; set; }
        [JsonProperty("committer_name")]
        public string CommiterName { get; set; }
        [JsonProperty("committer_email")]
        public string CommiterEmail { get; set; }
        [JsonProperty("message")]
        public string Message { get; set; }
        [JsonProperty("committed_date")]
        public DateTime CommitedDate { get; set; }
        [JsonProperty("stats")]
        public Stats Stats { get; set; }
        [JsonProperty("stats_codeonly")]
        public Stats CodeStats { get; set; }
        [JsonProperty("changed_files")]
        public List<String> ChangedFiles { get; set; }
        [JsonProperty("changed_codefiles")]
        public List<String> ChangedCodeFiles { get; set; }
        public bool ContainsCodeChanges => ChangedCodeFiles.Count > 0 && CodeStats.Total > 0;
        public bool PureCsChanges
        {
            get
            {
                for (int i = 0; i < ChangedFiles.Count; i++)
                {
                    if(!ChangedFiles[i].Contains(".cs"))
                    {
                        return false;
                    }
                }
                return true;
            }
        }
    }
}