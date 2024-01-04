// Queries keywords for pixabay image
const queries = ["morning", "evening", "night", "wildlife", "nasa", "sleep"];
// URL to fetch from NASA API
var url = `https://pixabay.com/api/?key=21533879-42550560049a6543e086fd75c&q=${
  queries[Math.round(Math.random() * queries.length)]
}&color=red&order=latest`;

var persistent_settings = {
  // Show 24-hours on clock
  is_24_hours_clock_enabled: true,
  is_clock_seconds_enabled: true,
  is_clock_date_enabled: false,
};

var local_storage_key = "persistent_settings";

$(document).ready(function () {
  // Sidebar and bottom bar reference
  var left_sidebar = $(".sidebar.left");
  var bottom_sidebar = $(".sidebar.bottom");
  // Main element
  var main = $("#main");
  // Buttons reference
  var btn_settings = $("#btn-settings");
  var btn_info = $("#btn-info");
  // Main display elements
  var greet = $("#greet");
  var time_text = $("#time");
  var date_text = $("#date");

  // Get the radio button groups of settings
  var radio_clock_hours = $("input[name='clock-hours']");
  var radio_clock_seconds = $("input[name='clock-seconds']");
  var radio_clock_date = $("input[name='clock-date']");

  // Get bottom bar elements
  var week_of_year = $("#week-of-year");
  var day_of_week = $("#day-of-week");
  var day_of_month = $("#day-of-month");
  var day_of_year = $("#day-of-year");
  var DateTime = luxon.DateTime;

  function updateGreet() {
    if (greet.html() != getGreeting(DateTime.local().hour) + ", ")
      greet.html(getGreeting(DateTime.local().hour) + ", ");
  }

  function updateTime() {
    const {
      is_24_hours_clock_enabled,
      is_clock_seconds_enabled,
    } = persistent_settings;

    var hoursFormat = is_24_hours_clock_enabled ? "HH" : "hh";
    var secondsFormat = is_clock_seconds_enabled ? ":ss" : "";
    time_text.html(
      DateTime.local().toFormat(
        hoursFormat +
          ":" +
          "mm" +
          secondsFormat +
          (!is_24_hours_clock_enabled ? " a" : "")
      )
    );
  }

  function updateDate() {
    const { is_clock_date_enabled } = persistent_settings;

    var html = date_text.html(DateTime.local().toFormat("DDD"));
    if (is_clock_date_enabled && date_text.html() != html) {
      date_text.html(DateTime.local().toFormat("DDD"));
    } else date_text.html("");
  }

  function updateRadioCheck() {
    const {
      is_24_hours_clock_enabled,
      is_clock_seconds_enabled,
      is_clock_date_enabled,
    } = persistent_settings;

    radio_clock_hours[is_24_hours_clock_enabled ? 0 : 1].checked = true;
    radio_clock_seconds[is_clock_seconds_enabled ? 0 : 1].checked = true;
    radio_clock_date[is_clock_date_enabled ? 0 : 1].checked = true;
  }

  function updateInfo() {
    week_of_year.html(DateTime.local().weekNumber);
    day_of_month.html(DateTime.local().day);
    day_of_week.html(DateTime.local().weekdayLong);
    day_of_year.html(DateTime.local().ordinal);
  }

  // Get dynamic background from Pixabay
  $.get(url, (data) => {
    const random = Math.round(Math.random() * data.hits.length);

    main.css("background-image", `url('${data.hits[random].largeImageURL}')`);
  });

  // Initialize sidebar and bottom bar
  left_sidebar.sidebar({ side: "left" });
  bottom_sidebar.sidebar({ side: "bottom" });

  // Close sidebars by default
  left_sidebar.trigger("sidebar:close");
  bottom_sidebar.trigger("sidebar:close");

  // Add click listener for gear icon
  btn_settings.on("click", function () {
    left_sidebar.trigger("sidebar:open");
  });

  // Add click listener for gear icon
  btn_info.on("click", function () {
    if (btn_info.html() != "Less") {
      btn_info.addClass("open");
      bottom_sidebar.prepend(btn_info);
      bottom_sidebar.trigger("sidebar:open");
      btn_info.html("Less");
    } else {
      btn_info.removeClass("open");
      main.append(btn_info);
      bottom_sidebar.trigger("sidebar:close");
      btn_info.html("More");
    }
  });

  // Listener for form submit
  $("form").on("submit", function (e) {
    // Prevent page refresh
    e.preventDefault();

    // Store settings in JSON
    persistent_settings.is_clock_date_enabled = getBoolean(
      radio_clock_date.filter(":checked").val()
    );
    persistent_settings.is_24_hours_clock_enabled = getBoolean(
      radio_clock_hours.filter(":checked").val()
    );
    persistent_settings.is_clock_seconds_enabled = getBoolean(
      radio_clock_seconds.filter(":checked").val()
    );

    // Save settings in local store
    save_settings();

    updateTime();
    updateDate();
  });

  updateGreet();
  restore_settings();
  updateRadioCheck();
  updateInfo();
  setInterval(updateTime, 500);
  setInterval(updateDate, 5000);
  setInterval(updateInfo, 5000);
  updateDate();
});

function restore_settings() {
  // Restore settings if available in local storage
  if (localStorage.getItem(local_storage_key) != undefined) {
    persistent_settings = JSON.parse(localStorage.getItem(local_storage_key));
  }
}

function save_settings() {
  // Store settings
  localStorage.setItem(local_storage_key, JSON.stringify(persistent_settings));
}

/* Convert string or numeric to boolean */
function getBoolean(value) {
  switch (value) {
    case true:
    case "true":
    case 1:
    case "1":
    case "on":
    case "yes":
      return true;
    default:
      return false;
  }
}

function closeSidebar() {
  var left_sidebar = $(".sidebar.left");

  // Close sidebar
  left_sidebar.trigger("sidebar:close");
}

/* Get greeting of the based on hours value */
function getGreeting(hours) {
  if (hours < 12 && hours > 3) return "Good Morning";
  else if (hours <= 16 && hours >= 12) return "Good Afternoon";
  else if (hours <= 24 && hours >= 17) return "Good Evening";
  return "Good Night";
}
