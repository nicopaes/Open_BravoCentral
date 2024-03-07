using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ElectronNET.API;
using ElectronNET.API.Entities;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BravoCentral
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // CreateWebHostBuilder(args).Build().Run();
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddElectron();
            builder.Services.AddRazorPages();
            builder.Services.AddServerSideBlazor().AddCircuitOptions(options => {  options.DetailedErrors = true; });
            builder.Services.AddHttpClient();

            builder.WebHost.UseElectron(args);
            // builder.WebHost.UseStaticWebAssets();
            var app = builder.Build();

            if (HybridSupport.IsElectronActive)
            {
                Utils.Log("Using Electron");
                // Open the Electron-Window here
                Task.Run(async () =>
                {
                    Utils.Log($"Trying to open window");
                    var options = new BrowserWindowOptions
                    {
                        Width = 1280,
                        Height = 1080,
                        Show = true
                    };
                    try
                    {
                        var window = await Electron.WindowManager.CreateWindowAsync(options);
                        Utils.Log($"ID: {window.Id}");
                        window.OnClosed += () =>
                        {
                            Electron.App.Quit();
                        };
                    }
                    catch
                    {
                        Utils.Log($"Error");
                    }
                });
            }

            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }

            app.UseStaticFiles();
            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapBlazorHub();
                endpoints.MapFallbackToPage("/_Host");
            });

            app.Run();
        }
    }
}
