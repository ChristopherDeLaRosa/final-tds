namespace EduCore.API.DTOs.StudentDTOs
{
    public class PagedResultDto<T>
    {
        public List<T> Data { get; set; } = new();
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
    }
}
