// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Hindi (`hi`).
class AppLocalizationsHi extends AppLocalizations {
  AppLocalizationsHi([String locale = 'hi']) : super(locale);

  @override
  String get brand_tag => 'Jaanch aur doctor, gaon ke paas';

  @override
  String get lang_switch => 'English';

  @override
  String get common_back => '← Peeche';

  @override
  String get common_loading => 'Load ho raha hai…';

  @override
  String get common_retry => 'Dobara koshish karein';

  @override
  String get common_save => 'Save karein';

  @override
  String get common_cancel => 'Rehne dein';

  @override
  String get common_logout => 'Logout';

  @override
  String get common_home => 'Home';

  @override
  String get common_next => 'Aage badhein →';

  @override
  String get common_free => 'Free';

  @override
  String get common_total => 'Kul';

  @override
  String common_km(Object n) {
    return '$n km';
  }

  @override
  String get common_self => 'Khud ke liye';

  @override
  String get common_optional => '(zaroori nahi)';

  @override
  String get landing_title => 'Gaon se bazaar jaane ki zaroorat nahi.';

  @override
  String get landing_sub =>
      'Khoon ki jaanch ghar se, aur doctor ka number ghar baithe.';

  @override
  String get landing_signup => 'Naya account banayein';

  @override
  String get landing_login => 'Login karein';

  @override
  String get landing_f1 => 'Lab wala ghar aakar sample lega';

  @override
  String get landing_f2 => 'Report phone pe dekhein';

  @override
  String get landing_f3 => 'Paas ke doctor ka number pehle se lagayein';

  @override
  String get landing_staffTitle => 'Lab, doctor aur team ka login';

  @override
  String get landing_staff =>
      'Lab, doctor aur agent ka account NidaanSetu team banati hai. Khud register nahi kar sakte.';

  @override
  String get auth_name => 'Aapka naam';

  @override
  String get auth_mobile => 'Mobile number';

  @override
  String get auth_email => 'Email';

  @override
  String get auth_password => 'Password';

  @override
  String get auth_passwordHint =>
      'Kam se kam 8 akshar, ek ank bhi ho (jaise ram12345)';

  @override
  String get auth_idLabel => 'Mobile number ya email';

  @override
  String get auth_signupTitle => 'Naya account';

  @override
  String get auth_signupBtn => 'Account banayein';

  @override
  String get auth_loginTitle => 'Login';

  @override
  String get auth_loginBtn => 'Login karein';

  @override
  String get auth_haveAccount => 'Pehle se account hai? Login karein';

  @override
  String get auth_noAccount => 'Account nahi hai? Naya banayein';

  @override
  String get auth_forgot => 'Password bhool gaye?';

  @override
  String get auth_forgotTitle => 'Password bhool gaye';

  @override
  String get auth_forgotHint =>
      'Apna registered email daalein. Password badalne ka link bhejenge. Email nahi hai toh NidaanSetu agent se sampark karein.';

  @override
  String get auth_forgotBtn => 'Link bhejein';

  @override
  String get auth_resetTitle => 'Naya password banayein';

  @override
  String get auth_newPassword => 'Naya password';

  @override
  String get auth_confirmPassword => 'Naya password dobara';

  @override
  String get auth_mismatch => 'Dono password ek jaise nahi hain';

  @override
  String get auth_changeTitle => 'Naya password banayein';

  @override
  String get auth_changeHint =>
      'Aapko temporary password mila tha. Aage badhne se pehle apna naya password banayein.';

  @override
  String get auth_currentPassword => 'Abhi wala (temporary) password';

  @override
  String get auth_changeBtn => 'Password badlein';

  @override
  String get village_title => 'Aapka gaon kaunsa hai?';

  @override
  String get village_sub =>
      'Hum aapke gaon ke paas ke lab aur doctor dikhayenge.';

  @override
  String get village_search => 'Gaon ka naam likhein';

  @override
  String get village_none => 'Yeh gaon abhi nahi juda. Paas ka gaon chunein.';

  @override
  String get village_change => 'Gaon badlein';

  @override
  String home_hello(Object name) {
    return 'Namaste $name! Aapko kya chahiye?';
  }

  @override
  String get home_tests => 'Jaanch book karein';

  @override
  String get home_testsSub => 'Khoon / peshab ki jaanch, ghar se sample';

  @override
  String get home_doctor => 'Doctor ka number';

  @override
  String get home_doctorSub => 'Kaun doctor kab baithte hain, fees kitni';

  @override
  String get home_mine => 'Meri booking aur report';

  @override
  String get home_mineSub => 'Status, OTP aur report dekhein';

  @override
  String get home_save => '🚌 Bazaar jaane ka kiraya aur din dono bachaiye.';

  @override
  String get home_profile => 'Profile aur parivaar';

  @override
  String get labs_title => 'Aapke paas ke lab';

  @override
  String labs_sub(Object village) {
    return '📍 $village se doori ke hisaab se';
  }

  @override
  String get labs_none =>
      'Abhi aapke gaon tak koi lab sample lene nahi aata. Jald hi judenge.';

  @override
  String get labs_home => '✓ Ghar se sample';

  @override
  String labs_tests(Object n) {
    return '$n test';
  }

  @override
  String labs_freeAbove(Object n) {
    return '₹$n+ pe collection free';
  }

  @override
  String labs_min(Object n) {
    return 'Kam se kam ₹$n';
  }

  @override
  String get labs_pick => 'Test chunein →';

  @override
  String get tests_title => 'Kaunsa test karwana hai?';

  @override
  String get tests_search => 'Test ka naam likhein (jaise sugar)';

  @override
  String get tests_fasting => 'Khaali pet';

  @override
  String get tests_none => 'Is naam ka test nahi mila.';

  @override
  String tests_count(Object n) {
    return '$n test';
  }

  @override
  String tests_fee(Object fee) {
    return ' + $fee ghar se sample';
  }

  @override
  String get tests_freeFee => ' · sample lena free';

  @override
  String tests_belowMin(Object n) {
    return 'Kam se kam ₹$n ki jaanch chunein';
  }

  @override
  String get details_title => 'Booking ki jaankari';

  @override
  String get details_who => 'Kiske liye?';

  @override
  String get details_addFamily => '+ Parivaar ka sadasya jodein';

  @override
  String get details_address => 'Ghar ka pata';

  @override
  String get details_addressPh => 'Mandir ke paas, ward 4';

  @override
  String details_addressHint(Object village) {
    return 'Gaon: $village';
  }

  @override
  String get details_day => 'Kis din?';

  @override
  String get details_slot => 'Kis samay?';

  @override
  String get details_fastingHint =>
      'Khaali pet wale test ke liye subah ka samay chunein.';

  @override
  String get details_pay => 'Paisa kaise denge?';

  @override
  String get details_cash => 'Cash';

  @override
  String get details_upi => 'UPI';

  @override
  String get details_payHint => 'Paisa sample dete samay dein.';

  @override
  String get details_homeFee => 'Ghar se sample';

  @override
  String get details_consent =>
      'Meri report lab aur mere doctor dekh sakte hain';

  @override
  String get details_confirm => 'Booking pakki karein ✓';

  @override
  String get details_sending => 'Bhej rahe hain…';

  @override
  String get booked_title => 'Booking ho gayi!';

  @override
  String get booked_code => 'Booking number';

  @override
  String get booked_otp => 'Collector ko yeh OTP batayein';

  @override
  String get booked_otpHint =>
      'Sample dete samay hi OTP batayein, pehle kisi ko nahi.';

  @override
  String booked_next(Object lab) {
    return '$lab aapki request dekh ke confirm karega.';
  }

  @override
  String get booked_mine => 'Meri booking dekhein';

  @override
  String get doctors_title => 'Paas ke doctor';

  @override
  String get doctors_all => 'Sabhi';

  @override
  String get doctors_none => 'Is tarah ke doctor abhi nahi jude.';

  @override
  String get doctors_when => 'Kab baithte hain';

  @override
  String get doctors_fee => 'Fees';

  @override
  String get doctors_take => 'Number lagayein →';

  @override
  String get doctors_pickDay => 'Kis din aayenge?';

  @override
  String get doctors_onlyDays =>
      'Sirf woh din dikh rahe hain jab doctor baithte hain.';

  @override
  String doctors_left(Object n) {
    return '$n number baaki';
  }

  @override
  String get doctors_full => 'Bhar gaya';

  @override
  String get doctors_noDays => 'Agle 2 hafte mein koi din khaali nahi.';

  @override
  String get doctors_confirm => 'Number pakka karein ✓';

  @override
  String get doctors_taking => 'Number laga rahe hain…';

  @override
  String get doctors_payAtClinic => 'Fees clinic pe doctor ko dein.';

  @override
  String get doctors_done => 'Number lag gaya!';

  @override
  String get doctors_yourToken => 'Aapka number';

  @override
  String get mine_title => 'Meri booking aur report';

  @override
  String get mine_tabTests => 'Jaanch';

  @override
  String get mine_tabDoctor => 'Doctor ka number';

  @override
  String get mine_noTests => 'Abhi koi jaanch book nahi ki.';

  @override
  String get mine_noAppts => 'Abhi koi doctor ka number nahi lagaya.';

  @override
  String mine_otp(Object otp) {
    return 'OTP: $otp (sample dete samay collector ko batayein)';
  }

  @override
  String mine_collector(Object time) {
    return '🚴 Collector $time aayega';
  }

  @override
  String get mine_locked =>
      'OTP lock ho gaya. NidaanSetu team se sampark karein.';

  @override
  String get mine_report => '📄 Report dekhein';

  @override
  String get mine_cancel => 'Cancel karein';

  @override
  String get mine_cancelSure => 'Pakka cancel karna hai?';

  @override
  String mine_referred(Object doctor) {
    return '🩺 $doctor ne likha';
  }

  @override
  String mine_referredTests(Object tests) {
    return 'Doctor ne test likha: $tests';
  }

  @override
  String mine_token(Object n) {
    return 'Number $n';
  }

  @override
  String mine_for(Object name) {
    return 'Mareez: $name';
  }

  @override
  String get status_requested => 'Request bheja gaya';

  @override
  String get status_confirmed => 'Lab ne confirm kiya';

  @override
  String get status_collected => 'Sample le liya';

  @override
  String get status_report_ready => 'Report taiyaar';

  @override
  String get status_cancelled => 'Cancel ho gaya';

  @override
  String get status_booked => 'Number laga';

  @override
  String get status_seen => 'Doctor ne dekh liya';

  @override
  String get status_no_show => 'Nahi aaye';

  @override
  String get profile_title => 'Profile';

  @override
  String get profile_family => 'Parivaar ke sadasya';

  @override
  String get profile_noFamily => 'Abhi koi sadasya nahi joda.';

  @override
  String get profile_add => 'Sadasya jodein';

  @override
  String get profile_age => 'Umar';

  @override
  String get profile_relation => 'Rishta';

  @override
  String get profile_relationPh => 'Maa, Pita, Beta…';

  @override
  String get profile_gender => 'Ling';

  @override
  String get profile_male => 'Purush';

  @override
  String get profile_female => 'Mahila';

  @override
  String get profile_other => 'Anya';

  @override
  String get profile_remove => 'Hatayein';

  @override
  String get profile_saved => 'Save ho gaya ✓';

  @override
  String get day_Mon => 'Somvar';

  @override
  String get day_Tue => 'Mangalvar';

  @override
  String get day_Wed => 'Budhvar';

  @override
  String get day_Thu => 'Guruvar';

  @override
  String get day_Fri => 'Shukravar';

  @override
  String get day_Sat => 'Shanivar';

  @override
  String get day_Sun => 'Ravivar';

  @override
  String get date_today => 'Aaj';

  @override
  String get date_tomorrow => 'Kal';

  @override
  String get slot_1 => 'Subah 6–8 baje';

  @override
  String get slot_2 => 'Subah 8–10 baje';

  @override
  String get slot_3 => 'Din 10–12 baje';

  @override
  String get landing_t1 => 'Ghar se sample';

  @override
  String get landing_t2 => 'Report sirf aapko';

  @override
  String get landing_t3 => 'Lab ka hi rate';

  @override
  String get landing_howTitle => 'Kaise kaam karta hai';

  @override
  String get receipt_title => 'Doctor ka number: receipt';

  @override
  String get receipt_patient => 'Mareez';

  @override
  String get receipt_doctor => 'Doctor';

  @override
  String get receipt_clinic => 'Clinic';

  @override
  String get receipt_when => 'Kab';

  @override
  String get receipt_payAtClinic => 'clinic pe dein';

  @override
  String get receipt_code => 'Visit code';

  @override
  String get receipt_codeHint =>
      'Clinic pe doctor ko yeh receipt aur code dikhayein. Code dene ke baad hi visit poori maani jaayegi.';

  @override
  String get receipt_print => 'Print / save karein';

  @override
  String get receipt_show => 'Receipt dekhein';

  @override
  String get receipt_hide => 'Receipt band karein';

  @override
  String get landing_s1 =>
      'Test aur lab chunein, ghar ka pata daalein. Lab ka collector ghar aakar sample lega aur aap OTP batakar pakka karenge.';

  @override
  String get landing_s2 =>
      'Report taiyaar hote hi phone pe dikhegi. Sirf aap, lab aur aapka doctor dekh sakte hain.';

  @override
  String get landing_s3 =>
      'Doctor chunein aur ghar baithe token lein. Apni baari pe hi jaayein.';

  @override
  String get landing_whyTitle => 'NidaanSetu kyun?';

  @override
  String get landing_w1 => 'Ghar se sample';

  @override
  String get landing_w1s => 'Bazaar jaane ka kiraya aur din dono bachao.';

  @override
  String get landing_w2 => 'Lab ka hi rate';

  @override
  String get landing_w2s =>
      'Wahi daam jo lab counter pe leta hai. Koi chhupa charge nahi.';

  @override
  String get landing_w3 => 'Report sirf aapko';

  @override
  String get landing_w3s =>
      'Report sirf aap, lab aur aapka doctor dekh sakte hain.';

  @override
  String get landing_w4 => 'Doctor ka token';

  @override
  String get landing_w4s =>
      'Lambi line nahi. Ghar baithe number lagao, time pe jao.';

  @override
  String get landing_popTitle => 'Aam jaanch';

  @override
  String get landing_popSub =>
      'Rate har lab ka alag hota hai. Account bana ke apne gaon ke paas ke lab ka rate dekhein.';

  @override
  String get landing_ctaTitle => 'Pehli jaanch aaj hi book karein';

  @override
  String get landing_ctaSub =>
      'Account banane mein 1 minute lagta hai. Sirf mobile number chahiye.';

  @override
  String get landing_card1 => 'Sample le liya';

  @override
  String get landing_card2 => 'Report taiyaar hai';

  @override
  String get landing_card3 => 'Kal subah 7 baje';

  @override
  String get landing_footTag =>
      'Gaon aur ilaaj ke beech ka setu. Siwan, Bihar.';

  @override
  String get landing_ctaBtn => 'Abhi shuru karein';

  @override
  String get flow_s1 => 'Lab chunein';

  @override
  String get flow_s2 => 'Test chunein';

  @override
  String get flow_s3 => 'Pata aur din';

  @override
  String get flow_label => 'Booking ke kadam';

  @override
  String get lang_label => 'Bhasha';

  @override
  String get err_name => 'Naam likhein';

  @override
  String get err_address => 'Ghar ka pata likhein';

  @override
  String get err_consent => 'Aage badhne ke liye tick karein';

  @override
  String get err_phone => '10 ankon ka sahi mobile number likhein';

  @override
  String get err_email => 'Sahi email likhein';

  @override
  String get err_loginBoth => 'Mobile/email aur password dono likhein';

  @override
  String get profile_mobileHint =>
      'Mobile number badalne ke liye NidaanSetu agent se sampark karein';

  @override
  String get profile_emailHint => 'Password bhoolne par email se link aayega';

  @override
  String get nav_doctor => 'Doctor';

  @override
  String get nav_booking => 'Booking';
}
