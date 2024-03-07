using System;
using System.Collections.Generic;
using BravoCentral.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace BravoCentral.Data
{
    [Serializable]
    public class WhoQuestions
    {
        [JsonProperty("authorEmail")]
        public string authorEmail;
        [JsonProperty("week")]
        public Week week;
        [JsonProperty("questions")]
        public List<Question> questions;

        public string AuthorEmail { get => authorEmail; }
        public Week Week { get => week; set => week = value; }
        public List<Question> Questions { get => questions; set => questions = value; }

        [JsonIgnore]
        public int Q1 => Questions[0].value;
        [JsonIgnore]
        public int Q2 => Questions[1].value;
        [JsonIgnore]
        public int Q3 => Questions[2].value;
        [JsonIgnore]
        public int Q4 => Questions[3].value;
        [JsonIgnore]
        public int Q5 => Questions[4].value;

        public int FinalPercentProp
        {
            get
            {
                return (int)FinalPercent();
            }
        }

        public bool CheckQuestions()
        {
            for (int i = 0; i < questions.Count; i++)
            {
                if(questions[i].value == -1) return false;
            }
            return true;
        }

        public void Change(int index, int newValue)
        {
            Utils.Log($"index {index} => new value{newValue}");
            if (index >= 0 && index < 5)
            {
                questions[index].Change(newValue);
            }
        }

        public override string ToString()
        {
            string ret = "";
            ret += $"Author email: {authorEmail}\n";
            ret += $"Week of The Year: {week.name}\n";

            for (int i = 0; i < 5; i++)
            {
                ret += $"Question {i}: {questions[i].value}\n";
            }

            return ret;
        }

        public float FinalPercent()
        {
            int sum = 0;
            for (int i = 0; i < questions.Count; i++)
            {
                sum += questions[i].value;
            }
            return sum*4;
        }
    }
}