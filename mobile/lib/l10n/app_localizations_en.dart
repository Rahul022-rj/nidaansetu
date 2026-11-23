// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get brand_tag => 'Tests and doctors, near your village';

  @override
  String get lang_switch => 'Hindi';

  @override
  String get common_back => '← Back';

  @override
  String get common_loading => 'Loading…';

  @override
  String get common_retry => 'Try again';

  @override
  String get common_save => 'Save';

  @override
  String get common_cancel => 'Cancel';

  @override
  String get common_logout => 'Logout';

  @override
  String get common_home => 'Home';

  @override
  String get common_next => 'Continue →';

  @override
  String get common_free => 'Free';

  @override
  String get common_total => 'Total';

  @override
  String common_km(Object n) {
    return '$n km';
  }

  @override
  String get common_self => 'For myself';

  @override
  String get common_optional => '(optional)';

  @override
  String get landing_title => 'No need to travel to the market town.';

  @override
  String get landing_sub =>
      'Blood tests from home, and a doctor\'s token without leaving home.';

  @override
  String get landing_signup => 'Create account';

  @override
  String get landing_login => 'Log in';

  @override
  String get landing_f1 => 'The lab collects the sample at your home';

  @override
  String get landing_f2 => 'See your report on your phone';

  @override
  String get landing_f3 => 'Book a token with a nearby doctor in advance';

  @override
  String get landing_staffTitle => 'Login for labs, doctors and team';

  @override
  String get landing_staff =>
      'Lab, doctor and agent accounts are created by the NidaanSetu team. They cannot self-register.';

  @override
  String get auth_name => 'Your name';

  @override
  String get auth_mobile => 'Mobile number';

  @override
  String get auth_email => 'Email';

  @override
  String get auth_password => 'Password';

  @override
  String get auth_passwordHint => 'At least 8 characters, including a number';

  @override
  String get auth_idLabel => 'Mobile number or email';

  @override
  String get auth_signupTitle => 'Create account';

  @override
  String get auth_signupBtn => 'Create account';

  @override
  String get auth_loginTitle => 'Log in';

  @override
  String get auth_loginBtn => 'Log in';

  @override
  String get auth_haveAccount => 'Already have an account? Log in';

  @override
  String get auth_noAccount => 'No account? Create one';

  @override
  String get auth_forgot => 'Forgot password?';

  @override
  String get auth_forgotTitle => 'Forgot password';

  @override
  String get auth_forgotHint =>
      'Enter your registered email and we\'ll send a reset link. No email? Contact a NidaanSetu agent.';

  @override
  String get auth_forgotBtn => 'Send link';

  @override
  String get auth_resetTitle => 'Set a new password';

  @override
  String get auth_newPassword => 'New password';

  @override
  String get auth_confirmPassword => 'Repeat new password';

  @override
  String get auth_mismatch => 'The passwords do not match';

  @override
  String get auth_changeTitle => 'Set a new password';

  @override
  String get auth_changeHint =>
      'You were given a temporary password. Please set your own password to continue.';

  @override
  String get auth_currentPassword => 'Current (temporary) password';

  @override
  String get auth_changeBtn => 'Change password';

  @override
  String get village_title => 'Which is your village?';

  @override
  String get village_sub => 'We\'ll show labs and doctors near your village.';

  @override
  String get village_search => 'Type village name';

  @override
  String get village_none =>
      'This village isn\'t listed yet. Pick a nearby one.';

  @override
  String get village_change => 'Change village';

  @override
  String home_hello(Object name) {
    return 'Namaste $name! What do you need?';
  }

  @override
  String get home_tests => 'Book a test';

  @override
  String get home_testsSub => 'Blood / urine tests, sample from home';

  @override
  String get home_doctor => 'Doctor token';

  @override
  String get home_doctorSub => 'Which doctor sits when, and the fee';

  @override
  String get home_mine => 'My bookings and reports';

  @override
  String get home_mineSub => 'Status, OTP and reports';

  @override
  String get home_save => '🚌 Save the bus fare and the day.';

  @override
  String get home_profile => 'Profile and family';

  @override
  String get labs_title => 'Labs near you';

  @override
  String labs_sub(Object village) {
    return '📍 Sorted by distance from $village';
  }

  @override
  String get labs_none =>
      'No lab collects samples in your village yet. Coming soon.';

  @override
  String get labs_home => '✓ Home collection';

  @override
  String labs_tests(Object n) {
    return '$n tests';
  }

  @override
  String labs_freeAbove(Object n) {
    return 'Free collection above ₹$n';
  }

  @override
  String labs_min(Object n) {
    return 'Minimum ₹$n';
  }

  @override
  String get labs_pick => 'Choose tests →';

  @override
  String get tests_title => 'Which tests do you need?';

  @override
  String get tests_search => 'Search tests (e.g. sugar)';

  @override
  String get tests_fasting => 'Fasting';

  @override
  String get tests_none => 'No test with that name.';

  @override
  String tests_count(Object n) {
    return '$n tests';
  }

  @override
  String tests_fee(Object fee) {
    return ' + $fee home collection';
  }

  @override
  String get tests_freeFee => ' · free collection';

  @override
  String tests_belowMin(Object n) {
    return 'Choose tests worth at least ₹$n';
  }

  @override
  String get details_title => 'Booking details';

  @override
  String get details_who => 'Who is it for?';

  @override
  String get details_addFamily => '+ Add family member';

  @override
  String get details_address => 'Home address';

  @override
  String get details_addressPh => 'Near the temple, ward 4';

  @override
  String details_addressHint(Object village) {
    return 'Village: $village';
  }

  @override
  String get details_day => 'Which day?';

  @override
  String get details_slot => 'What time?';

  @override
  String get details_fastingHint => 'For fasting tests, choose a morning slot.';

  @override
  String get details_pay => 'How will you pay?';

  @override
  String get details_cash => 'Cash';

  @override
  String get details_upi => 'UPI';

  @override
  String get details_payHint => 'Pay when the sample is collected.';

  @override
  String get details_homeFee => 'Home collection';

  @override
  String get details_consent => 'The lab and my doctor may see my report';

  @override
  String get details_confirm => 'Confirm booking ✓';

  @override
  String get details_sending => 'Sending…';

  @override
  String get booked_title => 'Booking done!';

  @override
  String get booked_code => 'Booking number';

  @override
  String get booked_otp => 'Tell this OTP to the collector';

  @override
  String get booked_otpHint => 'Share the OTP only when you give the sample.';

  @override
  String booked_next(Object lab) {
    return '$lab will review and confirm your request.';
  }

  @override
  String get booked_mine => 'See my bookings';

  @override
  String get doctors_title => 'Doctors near you';

  @override
  String get doctors_all => 'All';

  @override
  String get doctors_none => 'No doctors of this type yet.';

  @override
  String get doctors_when => 'Sits on';

  @override
  String get doctors_fee => 'Fee';

  @override
  String get doctors_take => 'Get token →';

  @override
  String get doctors_pickDay => 'Which day will you come?';

  @override
  String get doctors_onlyDays => 'Only days when the doctor sits are shown.';

  @override
  String doctors_left(Object n) {
    return '$n tokens left';
  }

  @override
  String get doctors_full => 'Full';

  @override
  String get doctors_noDays => 'No free day in the next 2 weeks.';

  @override
  String get doctors_confirm => 'Confirm token ✓';

  @override
  String get doctors_taking => 'Booking token…';

  @override
  String get doctors_payAtClinic => 'Pay the fee to the doctor at the clinic.';

  @override
  String get doctors_done => 'Token booked!';

  @override
  String get doctors_yourToken => 'Your token';

  @override
  String get mine_title => 'My bookings and reports';

  @override
  String get mine_tabTests => 'Tests';

  @override
  String get mine_tabDoctor => 'Doctor tokens';

  @override
  String get mine_noTests => 'No tests booked yet.';

  @override
  String get mine_noAppts => 'No doctor tokens yet.';

  @override
  String mine_otp(Object otp) {
    return 'OTP: $otp (tell the collector at sample time)';
  }

  @override
  String mine_collector(Object time) {
    return '🚴 Collector will come at $time';
  }

  @override
  String get mine_locked => 'OTP locked. Please contact the NidaanSetu team.';

  @override
  String get mine_report => '📄 View report';

  @override
  String get mine_cancel => 'Cancel';

  @override
  String get mine_cancelSure => 'Really cancel?';

  @override
  String mine_referred(Object doctor) {
    return '🩺 Prescribed by $doctor';
  }

  @override
  String mine_referredTests(Object tests) {
    return 'Doctor prescribed: $tests';
  }

  @override
  String mine_token(Object n) {
    return 'Token $n';
  }

  @override
  String mine_for(Object name) {
    return 'Patient: $name';
  }

  @override
  String get status_requested => 'Requested';

  @override
  String get status_confirmed => 'Confirmed by lab';

  @override
  String get status_collected => 'Sample collected';

  @override
  String get status_report_ready => 'Report ready';

  @override
  String get status_cancelled => 'Cancelled';

  @override
  String get status_booked => 'Token booked';

  @override
  String get status_seen => 'Seen by doctor';

  @override
  String get status_no_show => 'Did not come';

  @override
  String get profile_title => 'Profile';

  @override
  String get profile_family => 'Family members';

  @override
  String get profile_noFamily => 'No family members added yet.';

  @override
  String get profile_add => 'Add member';

  @override
  String get profile_age => 'Age';

  @override
  String get profile_relation => 'Relation';

  @override
  String get profile_relationPh => 'Mother, Father, Son…';

  @override
  String get profile_gender => 'Gender';

  @override
  String get profile_male => 'Male';

  @override
  String get profile_female => 'Female';

  @override
  String get profile_other => 'Other';

  @override
  String get profile_remove => 'Remove';

  @override
  String get profile_saved => 'Saved ✓';

  @override
  String get day_Mon => 'Monday';

  @override
  String get day_Tue => 'Tuesday';

  @override
  String get day_Wed => 'Wednesday';

  @override
  String get day_Thu => 'Thursday';

  @override
  String get day_Fri => 'Friday';

  @override
  String get day_Sat => 'Saturday';

  @override
  String get day_Sun => 'Sunday';

  @override
  String get date_today => 'Today';

  @override
  String get date_tomorrow => 'Tomorrow';

  @override
  String get slot_1 => '6–8 am';

  @override
  String get slot_2 => '8–10 am';

  @override
  String get slot_3 => '10 am–12 pm';

  @override
  String get landing_t1 => 'Home sample pickup';

  @override
  String get landing_t2 => 'Private reports';

  @override
  String get landing_t3 => 'Same price as the lab';

  @override
  String get landing_howTitle => 'How it works';

  @override
  String get receipt_title => 'Doctor token receipt';

  @override
  String get receipt_patient => 'Patient';

  @override
  String get receipt_doctor => 'Doctor';

  @override
  String get receipt_clinic => 'Clinic';

  @override
  String get receipt_when => 'When';

  @override
  String get receipt_payAtClinic => 'pay at clinic';

  @override
  String get receipt_code => 'Visit code';

  @override
  String get receipt_codeHint =>
      'Show this receipt and code to the doctor at the clinic. The visit is complete only after the code is given.';

  @override
  String get receipt_print => 'Print / save';

  @override
  String get receipt_show => 'Show receipt';

  @override
  String get receipt_hide => 'Hide receipt';

  @override
  String get landing_s1 =>
      'Pick tests and a lab, enter your address. The collector takes the sample at home and you confirm with your OTP.';

  @override
  String get landing_s2 =>
      'The report shows up on your phone as soon as it\'s ready. Only you, the lab and your doctor can see it.';

  @override
  String get landing_s3 =>
      'Pick a doctor and take a token from home. Go only when it\'s your turn.';

  @override
  String get landing_whyTitle => 'Why NidaanSetu?';

  @override
  String get landing_w1 => 'Home sample pickup';

  @override
  String get landing_w1s =>
      'Save the fare and the day lost travelling to town.';

  @override
  String get landing_w2 => 'Same price as the lab';

  @override
  String get landing_w2s => 'The lab\'s own counter price. No hidden charges.';

  @override
  String get landing_w3 => 'Private reports';

  @override
  String get landing_w3s =>
      'Only you, the lab and your doctor can see your report.';

  @override
  String get landing_w4 => 'Doctor tokens';

  @override
  String get landing_w4s =>
      'No long queues. Book a token from home and go on time.';

  @override
  String get landing_popTitle => 'Common tests';

  @override
  String get landing_popSub =>
      'Prices differ by lab. Create an account to see rates from labs near your village.';

  @override
  String get landing_ctaTitle => 'Book your first test today';

  @override
  String get landing_ctaSub =>
      'Creating an account takes a minute. Just your mobile number.';

  @override
  String get landing_card1 => 'Sample collected';

  @override
  String get landing_card2 => 'Report is ready';

  @override
  String get landing_card3 => 'Tomorrow, 7 AM';

  @override
  String get landing_footTag =>
      'The bridge between villages and care. Siwan, Bihar.';

  @override
  String get landing_ctaBtn => 'Get started';

  @override
  String get flow_s1 => 'Pick a lab';

  @override
  String get flow_s2 => 'Pick tests';

  @override
  String get flow_s3 => 'Address & day';

  @override
  String get flow_label => 'Booking steps';

  @override
  String get lang_label => 'Language';

  @override
  String get err_name => 'Enter a name';

  @override
  String get err_address => 'Enter your home address';

  @override
  String get err_consent => 'Tick this to continue';

  @override
  String get err_phone => 'Enter a valid 10-digit mobile number';

  @override
  String get err_email => 'Enter a valid email';

  @override
  String get err_loginBoth => 'Enter both mobile/email and password';

  @override
  String get profile_mobileHint =>
      'To change your mobile number, contact a NidaanSetu agent';

  @override
  String get profile_emailHint =>
      'A reset link comes to this email if you forget your password';

  @override
  String get nav_doctor => 'Doctor';

  @override
  String get nav_booking => 'Booking';
}
