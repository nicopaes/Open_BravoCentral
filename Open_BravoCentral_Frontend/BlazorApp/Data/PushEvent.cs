using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace BravoCentral.Data
{
    public class PushEvent
    {
        [JsonProperty("object_kind")]
        public string ObjectKind { get; set; }

        [JsonProperty("event_name")]
        public string EventName { get; set; }

        [JsonProperty("before")]
        public string Before { get; set; }

        [JsonProperty("after")]
        public string After { get; set; }

        [JsonProperty("ref")]
        public string Ref { get; set; }

        [JsonProperty("user_name")]
        public string UserName { get; set; }

        [JsonProperty("user_username")]
        public string UserUsername { get; set; }

        [JsonProperty("user_email")]
        public string UserEmail { get; set; }

        [JsonProperty("commits")]
        public Commit[] Commits { get; set; }

        public override string ToString()
        {
            return base.ToString();
        }
    }
}
