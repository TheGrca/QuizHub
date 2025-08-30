using Microsoft.AspNetCore.Mvc;
using quiz_hub_backend.DTO;
using quiz_hub_backend.Interfaces;

[ApiController]
[Route("api/[controller]")]
public class LiveQuizController : ControllerBase
{
    private readonly ILiveQuizService _liveQuizService;

    public LiveQuizController(ILiveQuizService liveQuizService)
    {
        _liveQuizService = liveQuizService;
    }

    [HttpGet("current")]
    public ActionResult<LiveQuizResponseDTO> GetCurrentLiveQuiz()
    {
        var currentQuiz = _liveQuizService.GetCurrentLiveQuiz();
        if (currentQuiz == null)
        {
            return NotFound("No live quiz is currently active");
        }
        return Ok(currentQuiz);
    }

    [HttpPost("end")]
    public async Task<IActionResult> EndLiveQuiz()
    {
        await _liveQuizService.HandleLiveQuizEnded();
        return Ok("Live quiz ended");
    }
}