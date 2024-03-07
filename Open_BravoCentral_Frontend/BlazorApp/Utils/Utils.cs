using System;
using System.Collections.Generic;
using System.Net.Http;
using Newtonsoft.Json;
using System.IO;
using ChartJs.Blazor.LineChart;
using ChartJs.Blazor.Common.Axes;
using ChartJs.Blazor.Common.Axes.Ticks;
using ChartJs.Blazor.Common;
using ChartJs.Blazor.Common.Enums;
using BravoCentral.Data;

public static class Utils
{
    public static void Log(object log)
    {
        if(DbMirror.main != null && DbMirror.main.log != null)
        {
            DbMirror.main.log.AppendLine(log.ToString());
        }       
        Console.WriteLine(log);
    }
    //TODO Use this to calculate median
    /// <summary>
    /// Gets the median value from an array
    /// </summary>
    /// <typeparam name="T">The array type</typeparam>
    /// <param name="sourceArray">The source array</param>
    /// <param name="cloneArray">If it doesn't matter if the source array is sorted, you can pass false to improve performance</param>
    /// <returns></returns>
    public static T GetMedian<T>(T[] sourceArray, bool cloneArray = true) where T : IComparable<T>
    {
        //Framework 2.0 version of this method. there is an easier way in F4        
        if (sourceArray == null || sourceArray.Length == 0)
            throw new ArgumentException("Median of empty array not defined.");

        //make sure the list is sorted, but use a new array
        T[] sortedArray = cloneArray ? (T[])sourceArray.Clone() : sourceArray;
        Array.Sort(sortedArray);

        //get the median
        int size = sortedArray.Length;
        int mid = size / 2;
        if (size % 2 != 0)
            return sortedArray[mid];

        dynamic value1 = sortedArray[mid];
        dynamic value2 = sortedArray[mid - 1];
        return (sortedArray[mid] + value2) * 0.5f;
    }

    /// <summary>
    /// Path NOT starting with "/"
    /// </summary>
    /// <param name="path"> Path NOT starting with "/" </param>
    /// <returns></returns>
    public static string GetRelativePath(string path)
    {
        return $"{AppDomain.CurrentDomain.BaseDirectory}/path";
    }

    public static string ToJsonString(object obj) => JsonConvert.SerializeObject(obj,Formatting.Indented);
    public static T FromJsonFile<T>(string path)
    {
        Utils.Log(path);
        if(!File.Exists(path)) return default(T);
        string fileString = File.ReadAllText(path);
        return JsonConvert.DeserializeObject<T>(fileString);
    }

    public static bool IsBetween(this DateTime input, DateTime date1, DateTime date2) { return (input >= date1 && input <= date2); }

    public static WeekStartEnd GetStartEndofWeek(int weekNumber)
    {
        Utils.Log(weekNumber);
        WeekStartEnd returnStruct = new WeekStartEnd();
        returnStruct.start = new DateTime(2022, 1, 1);
        returnStruct.start = returnStruct.start.AddDays(7 * weekNumber);
        returnStruct.end = returnStruct.start.AddDays(7);

        return returnStruct;
    }

    public static string ToUniversalIso8601(this DateTime dateTime)
    {
        return dateTime.ToUniversalTime().ToString("u").Replace(" ", "T");
    }

    public static async System.Threading.Tasks.Task<List<T>> GetListFromServerAsync<T>(string relativeEndpoint)
    {
        List<T> returnList;
        try
        {
            HttpClient http = new HttpClient();
            HttpResponseMessage res = await http.GetAsync($"{DbMirror.main.serveruri}/{relativeEndpoint}");
            string jsonRes = await res.Content.ReadAsStringAsync();
            Utils.Log($"GET {relativeEndpoint}");
            returnList = JsonConvert.DeserializeObject<List<T>>(jsonRes);
            return returnList;
        }
        catch (HttpRequestException e)
        {
            Utils.Log("\nException Caught!");
            Utils.Log($"Message :{e.Message} ");
            return null;
        }
    }
    public struct WeekStartEnd
    {
        public DateTime start;
        public DateTime end;
        public override string ToString()
        {
            return $"{start.ToShortDateString()} - {end.ToShortDateString()}";
        }
    }

    public static LineConfig GetDefaultLineConfigWeeks() => new LineConfig
    {
        Options = new LineOptions
        {
            Responsive = true,
            Legend = new Legend
            {
                Display = true,
                Position = Position.Right
            },
            Title = new OptionsTitle
            {
                Display = false,
            },
            Scales = new Scales
            {
                XAxes = new List<CartesianAxis>
{
new CategoryAxis
{
ScaleLabel = new ScaleLabel
{
LabelString = "Week"
}
}
},
                YAxes = new List<CartesianAxis>
{
new LinearCartesianAxis
{
Ticks = new LinearCartesianTicks
{
Min = 0,
StepSize = 10
},
ScaleLabel = new ScaleLabel
{
LabelString = "Value"
}
}
}
            }
        }
    };
}