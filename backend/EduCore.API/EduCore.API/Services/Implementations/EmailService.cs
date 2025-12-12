using EduCore.API.Services.Interfaces;
using System.Net;
using System.Net.Mail;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string to, string subject, string htmlContent)
    {
        try
        {
            using var smtpClient = new SmtpClient(_config["EmailSettings:SmtpServer"])
            {
                Port = int.Parse(_config["EmailSettings:Port"]),
                Credentials = new NetworkCredential(
                    _config["EmailSettings:SenderEmail"],
                    _config["EmailSettings:SenderPassword"]
                ),
                EnableSsl = true,
                UseDefaultCredentials = false
            };

            var mail = new MailMessage
            {
                From = new MailAddress(_config["EmailSettings:SenderEmail"], "Zirak"),
                Subject = subject,
                Body = htmlContent,
                IsBodyHtml = true
            };

            mail.To.Add(to);

            Console.WriteLine("Intentando enviar correo...");
            await smtpClient.SendMailAsync(mail);
            Console.WriteLine("Correo enviado correctamente.");
        }
        catch (Exception ex)
        {
            Console.WriteLine("ERROR EN SMTP: " + ex.Message);
            throw;
        }
    }

}
