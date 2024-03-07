using System;
using Newtonsoft.Json;

public class Ritual
{
    //Change this do enum, maybe ?
    [JsonProperty("ritual")]
    public string ritualType { get; set; }
    [JsonProperty("message")]
    public string message { get; set; }
    [JsonProperty("date")]
    public DateTime date { get; set; }
    [JsonProperty("author")]
    public string author { get; set; }

    [JsonIgnore]
    public string dateShort => $"{date.ToString("dd/MM/yy")}";

    public Ritual(string ritualType, string message, DateTime date, string author)
    {
        this.ritualType = ritualType;
        this.message = message;
        this.date = date;
        this.author = author;
    }
}