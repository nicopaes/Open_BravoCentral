using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace BravoCentral.Data
{
    public class Question
    {
        [JsonProperty("value")]
        public int value;

        // public Question()
        // {
        //     this.value = -1;
        // }

        public void Change(int newValue) => value = newValue;
    }
}