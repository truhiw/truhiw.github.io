const commandInput = document.getElementById('commandInput');
const screen = document.querySelector('.screen');
const audio = new Audio('music.mp3');
let musicPlaying = false;
let flipState = null;

const typed = new Typed('#typed-output', {
  strings: [
    'Chào mừng đến với terminal của Hiếu!',
    'Gõ "help" để xem các lệnh hỗ trợ.',
    'Gõ "about" để biết thông tin cá nhân của tôi.',
    'Gõ "contact" để xem thông tin liên hệ.',
    'Gõ "skills" để biết về các kỹ năng của tôi.',
    'Gõ "weather <thành phố>" để xem thời tiết.',
    'Gõ "play" để bắt đầu trò chơi rock-paper-scissors.',
    'Gõ "theme <light|dark>" để thay đổi giao diện.',
    'Gõ "clear" để xóa màn hình.',
    'Gõ "music" để bật/tắt nhạc nền.',
    'Gõ "flip" để tung đồng xu.'
    ],
  typeSpeed: 50,
  backSpeed: 25,
  loop: true,
});

let commandHistory = [];
let historyIndex = -1;
let rpsGame = null;
let botName = null;

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  switchTheme(savedTheme);
}

function switchTheme(theme) {
  document.body.classList.toggle('light-theme', theme === 'light');
  localStorage.setItem('theme', theme);
}

document.addEventListener('DOMContentLoaded', loadTheme);

function startClock() {
  const clockElement = document.getElementById('clock');
  setInterval(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    clockElement.textContent = timeString;
  }, 1000);
}

document.addEventListener('DOMContentLoaded', startClock);

function processCommand(command) {
  appendOutput(`$ ${command}`);
  const [cmd, ...args] = command.split(' ');
  const argString = args.join(' ');

  switch (cmd) {
    case 'help':
      appendOutput('Các lệnh hỗ trợ:');
      appendOutput('  about - Xem thông tin cá nhân');
      appendOutput('  contact - Xem thông tin liên hệ');
      appendOutput('  skills - Xem danh sách kỹ năng');
      appendOutput('  weather <thành phố> - Xem thời tiết');
      appendOutput('  play - Bắt đầu trò chơi mới');
      appendOutput('  rock|paper|scissors - Chọn nước đi');
      appendOutput('  theme <light|dark> - Đổi giao diện');
      appendOutput('  font +|- - Điều chỉnh cỡ chữ');
      appendOutput('  clear - Xóa màn hình');
      appendOutput('  music - Bật/tắt nhạc nền');
      appendOutput('  flip - Tung đồng xu');
      break;

    case 'about':
      showAbout();
      break;

    case 'contact':
      showContact();
      break;

    case 'skills':
      showSkills();
      break;

    case 'theme':
      if (argString === 'light' || argString === 'dark') {
        switchTheme(argString);
      } else {
        appendOutput('Cú pháp: theme <light|dark>');
      }
      break;

    case 'weather':
      if (argString) fetchWeather(argString);
      else fetchWeatherByLocation();
      break;

    case 'play':
      startGame();
      break;

    case 'clear':
      clearScreen();
      break;

    case 'font':
      if (args[0] === '+') adjustFontSize(2);
      else if (args[0] === '-') adjustFontSize(-2);
      else appendOutput('Cú pháp: font +|-');
      break;

    case 'rock':
    case 'paper':
    case 'scissors':
      playMove(cmd);
      break;
case 'volume':
      setVolume(argString);
      break;
    case 'exit':
      appendOutput('Tạm biệt! Hẹn gặp lại!');
      setTimeout(() => { window.close(); }, 2000);
      break;

    case 'music':
      toggleMusic();
      break;

    case 'flip':
      flipCoin();
      break;

    default:
      appendOutput(`Không tìm thấy lệnh: ${command}`);
  }
}

commandInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const input = commandInput.value.trim();
    if (input) {
      processCommand(input);
      commandInput.value = '';
    }
  } else if (e.key === 'ArrowUp') {
    if (historyIndex > 0) {
      historyIndex--;
      commandInput.value = commandHistory[historyIndex];
    }
  } else if (e.key === 'ArrowDown') {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      commandInput.value = commandHistory[historyIndex];
    }
  }
});

async function fetchWeather(city) {
  const apiKey = '904a111cb110d52b2b03c43f642137e4';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.cod === 200) {
      const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      appendOutput(`Thời tiết tại ${data.name}:`);
      appendOutput(`  ${data.weather[0].description}`);
      appendOutput(`  Nhiệt độ: ${data.main.temp}°C`);
      appendOutput(`  Độ ẩm: ${data.main.humidity}%`);
      appendOutput(`  Gió: ${data.wind.speed} m/s`);
      appendOutput(`  Áp suất: ${data.main.pressure} hPa`);
      appendOutput(`<img src="${iconUrl}" alt="icon thời tiết">`);
    } else {
      appendOutput(`Không tìm thấy thành phố: ${city}`);
    }
  } catch {
    appendOutput('Lỗi khi lấy dữ liệu thời tiết.');
  }
}

function fetchWeatherByLocation() {
  if (!navigator.geolocation) {
    appendOutput('Trình duyệt của bạn không hỗ trợ định vị.');
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const apiKey = '904a111cb110d52b2b03c43f642137e4';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.cod === 200) {
        const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        appendOutput(`Thời tiết tại ${data.name}:`);
        appendOutput(`  ${data.weather[0].description}`);
        appendOutput(`  Nhiệt độ: ${data.main.temp}°C`);
        appendOutput(`  Độ ẩm: ${data.main.humidity}%`);
        appendOutput(`  Gió: ${data.wind.speed} m/s`);
        appendOutput(`  Áp suất: ${data.main.pressure} hPa`);
        appendOutput(`<img src="${iconUrl}" alt="icon thời tiết">`);
      } else {
        appendOutput('Không thể lấy dữ liệu thời tiết từ vị trí của bạn.');
      }
    } catch {
      appendOutput('Lỗi khi lấy dữ liệu thời tiết.');
    }
  }, () => {
    appendOutput('Không thể định vị vị trí của bạn.');
  });
}

function startGame() {
  clearScreen();
  const botNames = ['An', 'Bình', 'Chi', 'Duy', 'Hương', 'Khoa', 'Lan'];
  botName = botNames[Math.floor(Math.random() * botNames.length)];
  rpsGame = { userScore: 0, botScore: 0, roundsPlayed: 0, maxRounds: 3 };
  appendOutput(`Bắt đầu trò chơi mới với ${botName}!`);
  appendOutput(`Gõ "rock", "paper", hoặc "scissors" để chọn nước đi.`);
  appendOutput(`Gõ "clear" để kết thúc trò chơi.`);
}

function handleMove(userChoice) {
  if (!rpsGame) {
    appendOutput('Hãy bắt đầu trò chơi trước bằng lệnh "play".');
    return;
  }

  const choices = ['rock', 'paper', 'scissors'];
  if (!choices.includes(userChoice)) {
    appendOutput('Cú pháp: rock|paper|scissors');
    return;
  }

  const botChoice = choices[Math.floor(Math.random() * choices.length)];
  appendOutput(`Bạn: ${userChoice}, ${botName}: ${botChoice}`);

  if (userChoice === botChoice) {
    appendOutput('Kết quả: Hòa!');
  } else if (
    (userChoice === 'rock' && botChoice === 'scissors') ||
    (userChoice === 'paper' && botChoice === 'rock') ||
    (userChoice === 'scissors' && botChoice === 'paper')
  ) {
    appendOutput('Kết quả: Bạn thắng vòng này!');
    rpsGame.userScore++;
  } else {
    appendOutput('Kết quả: Bạn thua vòng này!');
    rpsGame.botScore++;
  }

  rpsGame.roundsPlayed++;

  if (rpsGame.roundsPlayed >= rpsGame.maxRounds) {
    appendOutput(`Điểm cuối: Bạn ${rpsGame.userScore} - ${botName} ${rpsGame.botScore}`);
    if (rpsGame.userScore > rpsGame.botScore) {
      appendOutput(`Trò chơi kết thúc! Bạn thắng ${rpsGame.userScore}-${rpsGame.botScore}.`);
    } else if (rpsGame.botScore > rpsGame.userScore) {
      appendOutput(`Trò chơi kết thúc! Bạn thua ${rpsGame.botScore}-${rpsGame.userScore}.`);
    } else {
      appendOutput(`Trò chơi kết thúc! Hòa ${rpsGame.userScore}-${rpsGame.botScore}.`);
    }
    setTimeout(() => { clearScreen(); }, 5000);
    rpsGame = null;
  } else {
    appendOutput(`Điểm hiện tại: Bạn ${rpsGame.userScore} - ${botName} ${rpsGame.botScore}.`);
    appendOutput(`Vòng ${rpsGame.roundsPlayed + 1} trong ${rpsGame.maxRounds}, hãy chọn nước đi!`);
  }
}

function playMove(userChoice) {
  handleMove(userChoice);
}

function appendOutput(text, className = '') {
  const output = document.createElement('div');
  output.innerHTML = text;
  if (className) {
    output.classList.add(className);
  }
  const outputElement = screen.querySelector('.output');
  if (outputElement) {
    output.style.color = 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
  }
  const lineBreak = document.createElement('div'); 
  screen.insertBefore(output, screen.querySelector('.input'));
  screen.insertBefore(lineBreak, screen.querySelector('.input'));
  
  screen.scrollTop = screen.scrollHeight;
}

function clearScreen() {
  rpsGame = null;
  const outputs = screen.querySelectorAll('div:not(.input)');
  outputs.forEach((output) => output.remove());
}

function adjustFontSize(delta) {
  const screen = document.querySelector('.screen');
  const currentSize = parseFloat(window.getComputedStyle(screen).fontSize);
  screen.style.fontSize = `${currentSize + delta}px`;
}

function showAbout() {
  appendOutput('Thông tin cá nhân:');
  appendOutput(`  Họ tên: Trần Trung Hiếu`);
  appendOutput(`  Ngày sinh: 27/02/2008`);
  appendOutput(`  Giới tính: Nam`);
  appendOutput(`  Quê quán: Phú Thọ, Việt Nam`);
  appendOutput(`  Giới thiệu: Là học sinh, đam mê lịch sử Việt Nam và công nghệ máy tính.`);
}

function showContact() {
  appendOutput('Thông tin liên hệ:');
  appendOutput('  Email: <a href="mailto:trantrunghieu210289@gmail.com">trantrunghieu210289@gmail.com</a>');
  appendOutput('  Instagram: <a href="https://www.instagram.com/05hiwwy" target="_blank">@05hiwwy</a>');
  appendOutput('  Facebook: <a href="https://www.facebook.com/truhiw" target="_blank">Trần Trung Hiếu</a>');
}

function showSkills() {
  appendOutput('Kỹ năng:');
  addProgressBar('JavaScript', 80);
  addProgressBar('HTML', 70);
  addProgressBar('Python', 40);
}

function addProgressBar(skill, percentage) {
  const progressBar = document.createElement('div');
  const filledBlocks = Math.round(percentage / 5);
  const totalBlocks = 20;
  const emptyBlocks = totalBlocks - filledBlocks;

  const progressText = `[${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)}] ${percentage}%`;

  progressBar.innerHTML = `<strong>${skill}:</strong> ${progressText}`;
  screen.insertBefore(progressBar, screen.querySelector('.input'));
}

function setVolume(volumeArg) {
  const volume = parseInt(volumeArg);
  if (isNaN(volume) || volume < 0 || volume > 100) {
    appendOutput('Cú pháp: volume <0-100>');
  } else {
    audio.volume = volume / 100; 
    appendOutput(`Đã thay đổi âm lượng thành: ${volume}%`);
  }
}

function toggleMusic() {
  if (musicPlaying) {
    audio.pause();
    appendOutput('Nhạc nền đã tắt.');
  } else {
    audio.loop = true;
    audio.play();
    appendOutput('Nhạc nền đã bật.');
  }
  musicPlaying = !musicPlaying;
}

function updateSongInfo() {
  const songInfoElement = document.getElementById('songInfo');
  const currentTime = audio.currentTime;
  const duration = audio.duration;

  if (!duration || isNaN(duration)) return;

  const currentMinutes = Math.floor(currentTime / 60);
  const currentSeconds = Math.floor(currentTime % 60);
  const durationMinutes = Math.floor(duration / 60);
  const durationSeconds = Math.floor(duration % 60);

  // Format time as mm:ss
  const formattedCurrentTime = `${currentMinutes}:${currentSeconds < 10 ? '0' + currentSeconds : currentSeconds}`;
  const formattedDuration = `${durationMinutes}:${durationSeconds < 10 ? '0' + durationSeconds : durationSeconds}`;

  songInfoElement.textContent = `💿 ${formattedCurrentTime}/${formattedDuration}`;
}
audio.addEventListener('timeupdate', updateSongInfo);
function flipCoin() {
  const result = Math.random() < 0.5 ? 'Ngửa' : 'Hào';
  appendOutput(`Kết quả tung đồng xu: ${result}`);
}
