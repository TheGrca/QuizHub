using Microsoft.AspNetCore.Mvc;

namespace quiz_hub_backend.Controllers
{
    public class UserController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
