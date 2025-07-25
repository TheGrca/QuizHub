using Microsoft.EntityFrameworkCore;
using quiz_hub_backend.DTO;
using quiz_hub_backend.Interfaces;
using quiz_hub_backend.Models;

namespace quiz_hub_backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthService(AppDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDTO loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == loginDto.EmailOrUsername || u.Email == loginDto.EmailOrUsername);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            var token = _tokenService.GenerateToken(user);
            var userDto = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                ProfilePictureBase64 = Convert.ToBase64String(user.Image),
                Role = (int)user.isAdmin
            };

            return new AuthResponseDto
            {
                Token = token,
                User = userDto
            };
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDTO registerDto)
        {
            // Validate unique username and email
            if (!await IsUsernameUniqueAsync(registerDto.Username))
            {
                throw new ArgumentException("Username already exists");
            }

            if (!await IsEmailUniqueAsync(registerDto.Email))
            {
                throw new ArgumentException("Email already exists");
            }

            // Convert image to byte array
            byte[] imageBytes;
            using (var memoryStream = new MemoryStream())
            {
                await registerDto.ProfilePicture.CopyToAsync(memoryStream);
                imageBytes = memoryStream.ToArray();
            }

            // Hash password
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Password = hashedPassword,
                Image = imageBytes,
                isAdmin = UserType.User
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _tokenService.GenerateToken(user);
            var userDto = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                ProfilePictureBase64 = Convert.ToBase64String(user.Image),
                Role = (int)user.isAdmin
            };

            return new AuthResponseDto
            {
                Token = token,
                User = userDto
            };
        }

        public async Task<bool> IsUsernameUniqueAsync(string username)
        {
            return !await _context.Users.AnyAsync(u => u.Username == username);
        }

        public async Task<bool> IsEmailUniqueAsync(string email)
        {
            return !await _context.Users.AnyAsync(u => u.Email == email);
        }
    }
}

