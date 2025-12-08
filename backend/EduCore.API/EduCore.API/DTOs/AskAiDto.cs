namespace EduCore.API.DTOs
{
    public class AskAiDto
    {
        public string Prompt { get; set; } = string.Empty;
    }

    public class AiResponseDto
    {
        public string Prompt { get; set; } = string.Empty;
        public string Response { get; set; } = string.Empty;
    }

}
