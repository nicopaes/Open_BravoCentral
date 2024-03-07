using System;
using System.Drawing;
using Newtonsoft.Json;

namespace BravoCentral.Data
{
    public class User
    {
        public User(string name, string email)
        {
            this.name = name;
            this.email = email;
        }

        [JsonProperty("name")]
        public string name { get; set; }
        [JsonIgnore]
        public string displayName
        {
            get
            {
                return AnonName;
                // else return name;
            }
        }

        [JsonProperty("email")]
        public string email { get; set; }
        
        [JsonProperty("colorPrimary")]
        public Color colorPrimary;
        
        [JsonProperty("colorSecundary")]
        public Color colorSecundary;
        public string ShortName
        {
            get
            {
                return AnonName;
                // else return name.Split(" ")[0];
            }            
        }

        [JsonProperty("area")]
        public string Area { get; set; }
        [JsonProperty("anonname")]
        public string AnonName { get; set; }
    }
}