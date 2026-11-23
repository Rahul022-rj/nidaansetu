import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_hi.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('hi'),
  ];

  /// No description provided for @brand_tag.
  ///
  /// In en, this message translates to:
  /// **'Tests and doctors, near your village'**
  String get brand_tag;

  /// No description provided for @lang_switch.
  ///
  /// In en, this message translates to:
  /// **'Hindi'**
  String get lang_switch;

  /// No description provided for @common_back.
  ///
  /// In en, this message translates to:
  /// **'← Back'**
  String get common_back;

  /// No description provided for @common_loading.
  ///
  /// In en, this message translates to:
  /// **'Loading…'**
  String get common_loading;

  /// No description provided for @common_retry.
  ///
  /// In en, this message translates to:
  /// **'Try again'**
  String get common_retry;

  /// No description provided for @common_save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get common_save;

  /// No description provided for @common_cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get common_cancel;

  /// No description provided for @common_logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get common_logout;

  /// No description provided for @common_home.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get common_home;

  /// No description provided for @common_next.
  ///
  /// In en, this message translates to:
  /// **'Continue →'**
  String get common_next;

  /// No description provided for @common_free.
  ///
  /// In en, this message translates to:
  /// **'Free'**
  String get common_free;

  /// No description provided for @common_total.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get common_total;

  /// No description provided for @common_km.
  ///
  /// In en, this message translates to:
  /// **'{n} km'**
  String common_km(Object n);

  /// No description provided for @common_self.
  ///
  /// In en, this message translates to:
  /// **'For myself'**
  String get common_self;

  /// No description provided for @common_optional.
  ///
  /// In en, this message translates to:
  /// **'(optional)'**
  String get common_optional;

  /// No description provided for @landing_title.
  ///
  /// In en, this message translates to:
  /// **'No need to travel to the market town.'**
  String get landing_title;

  /// No description provided for @landing_sub.
  ///
  /// In en, this message translates to:
  /// **'Blood tests from home, and a doctor\'s token without leaving home.'**
  String get landing_sub;

  /// No description provided for @landing_signup.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get landing_signup;

  /// No description provided for @landing_login.
  ///
  /// In en, this message translates to:
  /// **'Log in'**
  String get landing_login;

  /// No description provided for @landing_f1.
  ///
  /// In en, this message translates to:
  /// **'The lab collects the sample at your home'**
  String get landing_f1;

  /// No description provided for @landing_f2.
  ///
  /// In en, this message translates to:
  /// **'See your report on your phone'**
  String get landing_f2;

  /// No description provided for @landing_f3.
  ///
  /// In en, this message translates to:
  /// **'Book a token with a nearby doctor in advance'**
  String get landing_f3;

  /// No description provided for @landing_staffTitle.
  ///
  /// In en, this message translates to:
  /// **'Login for labs, doctors and team'**
  String get landing_staffTitle;

  /// No description provided for @landing_staff.
  ///
  /// In en, this message translates to:
  /// **'Lab, doctor and agent accounts are created by the NidaanSetu team. They cannot self-register.'**
  String get landing_staff;

  /// No description provided for @auth_name.
  ///
  /// In en, this message translates to:
  /// **'Your name'**
  String get auth_name;

  /// No description provided for @auth_mobile.
  ///
  /// In en, this message translates to:
  /// **'Mobile number'**
  String get auth_mobile;

  /// No description provided for @auth_email.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get auth_email;

  /// No description provided for @auth_password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get auth_password;

  /// No description provided for @auth_passwordHint.
  ///
  /// In en, this message translates to:
  /// **'At least 8 characters, including a number'**
  String get auth_passwordHint;

  /// No description provided for @auth_idLabel.
  ///
  /// In en, this message translates to:
  /// **'Mobile number or email'**
  String get auth_idLabel;

  /// No description provided for @auth_signupTitle.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get auth_signupTitle;

  /// No description provided for @auth_signupBtn.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get auth_signupBtn;

  /// No description provided for @auth_loginTitle.
  ///
  /// In en, this message translates to:
  /// **'Log in'**
  String get auth_loginTitle;

  /// No description provided for @auth_loginBtn.
  ///
  /// In en, this message translates to:
  /// **'Log in'**
  String get auth_loginBtn;

  /// No description provided for @auth_haveAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account? Log in'**
  String get auth_haveAccount;

  /// No description provided for @auth_noAccount.
  ///
  /// In en, this message translates to:
  /// **'No account? Create one'**
  String get auth_noAccount;

  /// No description provided for @auth_forgot.
  ///
  /// In en, this message translates to:
  /// **'Forgot password?'**
  String get auth_forgot;

  /// No description provided for @auth_forgotTitle.
  ///
  /// In en, this message translates to:
  /// **'Forgot password'**
  String get auth_forgotTitle;

  /// No description provided for @auth_forgotHint.
  ///
  /// In en, this message translates to:
  /// **'Enter your registered email and we\'ll send a reset link. No email? Contact a NidaanSetu agent.'**
  String get auth_forgotHint;

  /// No description provided for @auth_forgotBtn.
  ///
  /// In en, this message translates to:
  /// **'Send link'**
  String get auth_forgotBtn;

  /// No description provided for @auth_resetTitle.
  ///
  /// In en, this message translates to:
  /// **'Set a new password'**
  String get auth_resetTitle;

  /// No description provided for @auth_newPassword.
  ///
  /// In en, this message translates to:
  /// **'New password'**
  String get auth_newPassword;

  /// No description provided for @auth_confirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Repeat new password'**
  String get auth_confirmPassword;

  /// No description provided for @auth_mismatch.
  ///
  /// In en, this message translates to:
  /// **'The passwords do not match'**
  String get auth_mismatch;

  /// No description provided for @auth_changeTitle.
  ///
  /// In en, this message translates to:
  /// **'Set a new password'**
  String get auth_changeTitle;

  /// No description provided for @auth_changeHint.
  ///
  /// In en, this message translates to:
  /// **'You were given a temporary password. Please set your own password to continue.'**
  String get auth_changeHint;

  /// No description provided for @auth_currentPassword.
  ///
  /// In en, this message translates to:
  /// **'Current (temporary) password'**
  String get auth_currentPassword;

  /// No description provided for @auth_changeBtn.
  ///
  /// In en, this message translates to:
  /// **'Change password'**
  String get auth_changeBtn;

  /// No description provided for @village_title.
  ///
  /// In en, this message translates to:
  /// **'Which is your village?'**
  String get village_title;

  /// No description provided for @village_sub.
  ///
  /// In en, this message translates to:
  /// **'We\'ll show labs and doctors near your village.'**
  String get village_sub;

  /// No description provided for @village_search.
  ///
  /// In en, this message translates to:
  /// **'Type village name'**
  String get village_search;

  /// No description provided for @village_none.
  ///
  /// In en, this message translates to:
  /// **'This village isn\'t listed yet. Pick a nearby one.'**
  String get village_none;

  /// No description provided for @village_change.
  ///
  /// In en, this message translates to:
  /// **'Change village'**
  String get village_change;

  /// No description provided for @home_hello.
  ///
  /// In en, this message translates to:
  /// **'Namaste {name}! What do you need?'**
  String home_hello(Object name);

  /// No description provided for @home_tests.
  ///
  /// In en, this message translates to:
  /// **'Book a test'**
  String get home_tests;

  /// No description provided for @home_testsSub.
  ///
  /// In en, this message translates to:
  /// **'Blood / urine tests, sample from home'**
  String get home_testsSub;

  /// No description provided for @home_doctor.
  ///
  /// In en, this message translates to:
  /// **'Doctor token'**
  String get home_doctor;

  /// No description provided for @home_doctorSub.
  ///
  /// In en, this message translates to:
  /// **'Which doctor sits when, and the fee'**
  String get home_doctorSub;

  /// No description provided for @home_mine.
  ///
  /// In en, this message translates to:
  /// **'My bookings and reports'**
  String get home_mine;

  /// No description provided for @home_mineSub.
  ///
  /// In en, this message translates to:
  /// **'Status, OTP and reports'**
  String get home_mineSub;

  /// No description provided for @home_save.
  ///
  /// In en, this message translates to:
  /// **'🚌 Save the bus fare and the day.'**
  String get home_save;

  /// No description provided for @home_profile.
  ///
  /// In en, this message translates to:
  /// **'Profile and family'**
  String get home_profile;

  /// No description provided for @labs_title.
  ///
  /// In en, this message translates to:
  /// **'Labs near you'**
  String get labs_title;

  /// No description provided for @labs_sub.
  ///
  /// In en, this message translates to:
  /// **'📍 Sorted by distance from {village}'**
  String labs_sub(Object village);

  /// No description provided for @labs_none.
  ///
  /// In en, this message translates to:
  /// **'No lab collects samples in your village yet. Coming soon.'**
  String get labs_none;

  /// No description provided for @labs_home.
  ///
  /// In en, this message translates to:
  /// **'✓ Home collection'**
  String get labs_home;

  /// No description provided for @labs_tests.
  ///
  /// In en, this message translates to:
  /// **'{n} tests'**
  String labs_tests(Object n);

  /// No description provided for @labs_freeAbove.
  ///
  /// In en, this message translates to:
  /// **'Free collection above ₹{n}'**
  String labs_freeAbove(Object n);

  /// No description provided for @labs_min.
  ///
  /// In en, this message translates to:
  /// **'Minimum ₹{n}'**
  String labs_min(Object n);

  /// No description provided for @labs_pick.
  ///
  /// In en, this message translates to:
  /// **'Choose tests →'**
  String get labs_pick;

  /// No description provided for @tests_title.
  ///
  /// In en, this message translates to:
  /// **'Which tests do you need?'**
  String get tests_title;

  /// No description provided for @tests_search.
  ///
  /// In en, this message translates to:
  /// **'Search tests (e.g. sugar)'**
  String get tests_search;

  /// No description provided for @tests_fasting.
  ///
  /// In en, this message translates to:
  /// **'Fasting'**
  String get tests_fasting;

  /// No description provided for @tests_none.
  ///
  /// In en, this message translates to:
  /// **'No test with that name.'**
  String get tests_none;

  /// No description provided for @tests_count.
  ///
  /// In en, this message translates to:
  /// **'{n} tests'**
  String tests_count(Object n);

  /// No description provided for @tests_fee.
  ///
  /// In en, this message translates to:
  /// **' + {fee} home collection'**
  String tests_fee(Object fee);

  /// No description provided for @tests_freeFee.
  ///
  /// In en, this message translates to:
  /// **' · free collection'**
  String get tests_freeFee;

  /// No description provided for @tests_belowMin.
  ///
  /// In en, this message translates to:
  /// **'Choose tests worth at least ₹{n}'**
  String tests_belowMin(Object n);

  /// No description provided for @details_title.
  ///
  /// In en, this message translates to:
  /// **'Booking details'**
  String get details_title;

  /// No description provided for @details_who.
  ///
  /// In en, this message translates to:
  /// **'Who is it for?'**
  String get details_who;

  /// No description provided for @details_addFamily.
  ///
  /// In en, this message translates to:
  /// **'+ Add family member'**
  String get details_addFamily;

  /// No description provided for @details_address.
  ///
  /// In en, this message translates to:
  /// **'Home address'**
  String get details_address;

  /// No description provided for @details_addressPh.
  ///
  /// In en, this message translates to:
  /// **'Near the temple, ward 4'**
  String get details_addressPh;

  /// No description provided for @details_addressHint.
  ///
  /// In en, this message translates to:
  /// **'Village: {village}'**
  String details_addressHint(Object village);

  /// No description provided for @details_day.
  ///
  /// In en, this message translates to:
  /// **'Which day?'**
  String get details_day;

  /// No description provided for @details_slot.
  ///
  /// In en, this message translates to:
  /// **'What time?'**
  String get details_slot;

  /// No description provided for @details_fastingHint.
  ///
  /// In en, this message translates to:
  /// **'For fasting tests, choose a morning slot.'**
  String get details_fastingHint;

  /// No description provided for @details_pay.
  ///
  /// In en, this message translates to:
  /// **'How will you pay?'**
  String get details_pay;

  /// No description provided for @details_cash.
  ///
  /// In en, this message translates to:
  /// **'Cash'**
  String get details_cash;

  /// No description provided for @details_upi.
  ///
  /// In en, this message translates to:
  /// **'UPI'**
  String get details_upi;

  /// No description provided for @details_payHint.
  ///
  /// In en, this message translates to:
  /// **'Pay when the sample is collected.'**
  String get details_payHint;

  /// No description provided for @details_homeFee.
  ///
  /// In en, this message translates to:
  /// **'Home collection'**
  String get details_homeFee;

  /// No description provided for @details_consent.
  ///
  /// In en, this message translates to:
  /// **'The lab and my doctor may see my report'**
  String get details_consent;

  /// No description provided for @details_confirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm booking ✓'**
  String get details_confirm;

  /// No description provided for @details_sending.
  ///
  /// In en, this message translates to:
  /// **'Sending…'**
  String get details_sending;

  /// No description provided for @booked_title.
  ///
  /// In en, this message translates to:
  /// **'Booking done!'**
  String get booked_title;

  /// No description provided for @booked_code.
  ///
  /// In en, this message translates to:
  /// **'Booking number'**
  String get booked_code;

  /// No description provided for @booked_otp.
  ///
  /// In en, this message translates to:
  /// **'Tell this OTP to the collector'**
  String get booked_otp;

  /// No description provided for @booked_otpHint.
  ///
  /// In en, this message translates to:
  /// **'Share the OTP only when you give the sample.'**
  String get booked_otpHint;

  /// No description provided for @booked_next.
  ///
  /// In en, this message translates to:
  /// **'{lab} will review and confirm your request.'**
  String booked_next(Object lab);

  /// No description provided for @booked_mine.
  ///
  /// In en, this message translates to:
  /// **'See my bookings'**
  String get booked_mine;

  /// No description provided for @doctors_title.
  ///
  /// In en, this message translates to:
  /// **'Doctors near you'**
  String get doctors_title;

  /// No description provided for @doctors_all.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get doctors_all;

  /// No description provided for @doctors_none.
  ///
  /// In en, this message translates to:
  /// **'No doctors of this type yet.'**
  String get doctors_none;

  /// No description provided for @doctors_when.
  ///
  /// In en, this message translates to:
  /// **'Sits on'**
  String get doctors_when;

  /// No description provided for @doctors_fee.
  ///
  /// In en, this message translates to:
  /// **'Fee'**
  String get doctors_fee;

  /// No description provided for @doctors_take.
  ///
  /// In en, this message translates to:
  /// **'Get token →'**
  String get doctors_take;

  /// No description provided for @doctors_pickDay.
  ///
  /// In en, this message translates to:
  /// **'Which day will you come?'**
  String get doctors_pickDay;

  /// No description provided for @doctors_onlyDays.
  ///
  /// In en, this message translates to:
  /// **'Only days when the doctor sits are shown.'**
  String get doctors_onlyDays;

  /// No description provided for @doctors_left.
  ///
  /// In en, this message translates to:
  /// **'{n} tokens left'**
  String doctors_left(Object n);

  /// No description provided for @doctors_full.
  ///
  /// In en, this message translates to:
  /// **'Full'**
  String get doctors_full;

  /// No description provided for @doctors_noDays.
  ///
  /// In en, this message translates to:
  /// **'No free day in the next 2 weeks.'**
  String get doctors_noDays;

  /// No description provided for @doctors_confirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm token ✓'**
  String get doctors_confirm;

  /// No description provided for @doctors_taking.
  ///
  /// In en, this message translates to:
  /// **'Booking token…'**
  String get doctors_taking;

  /// No description provided for @doctors_payAtClinic.
  ///
  /// In en, this message translates to:
  /// **'Pay the fee to the doctor at the clinic.'**
  String get doctors_payAtClinic;

  /// No description provided for @doctors_done.
  ///
  /// In en, this message translates to:
  /// **'Token booked!'**
  String get doctors_done;

  /// No description provided for @doctors_yourToken.
  ///
  /// In en, this message translates to:
  /// **'Your token'**
  String get doctors_yourToken;

  /// No description provided for @mine_title.
  ///
  /// In en, this message translates to:
  /// **'My bookings and reports'**
  String get mine_title;

  /// No description provided for @mine_tabTests.
  ///
  /// In en, this message translates to:
  /// **'Tests'**
  String get mine_tabTests;

  /// No description provided for @mine_tabDoctor.
  ///
  /// In en, this message translates to:
  /// **'Doctor tokens'**
  String get mine_tabDoctor;

  /// No description provided for @mine_noTests.
  ///
  /// In en, this message translates to:
  /// **'No tests booked yet.'**
  String get mine_noTests;

  /// No description provided for @mine_noAppts.
  ///
  /// In en, this message translates to:
  /// **'No doctor tokens yet.'**
  String get mine_noAppts;

  /// No description provided for @mine_otp.
  ///
  /// In en, this message translates to:
  /// **'OTP: {otp} (tell the collector at sample time)'**
  String mine_otp(Object otp);

  /// No description provided for @mine_collector.
  ///
  /// In en, this message translates to:
  /// **'🚴 Collector will come at {time}'**
  String mine_collector(Object time);

  /// No description provided for @mine_locked.
  ///
  /// In en, this message translates to:
  /// **'OTP locked. Please contact the NidaanSetu team.'**
  String get mine_locked;

  /// No description provided for @mine_report.
  ///
  /// In en, this message translates to:
  /// **'📄 View report'**
  String get mine_report;

  /// No description provided for @mine_cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get mine_cancel;

  /// No description provided for @mine_cancelSure.
  ///
  /// In en, this message translates to:
  /// **'Really cancel?'**
  String get mine_cancelSure;

  /// No description provided for @mine_referred.
  ///
  /// In en, this message translates to:
  /// **'🩺 Prescribed by {doctor}'**
  String mine_referred(Object doctor);

  /// No description provided for @mine_referredTests.
  ///
  /// In en, this message translates to:
  /// **'Doctor prescribed: {tests}'**
  String mine_referredTests(Object tests);

  /// No description provided for @mine_token.
  ///
  /// In en, this message translates to:
  /// **'Token {n}'**
  String mine_token(Object n);

  /// No description provided for @mine_for.
  ///
  /// In en, this message translates to:
  /// **'Patient: {name}'**
  String mine_for(Object name);

  /// No description provided for @status_requested.
  ///
  /// In en, this message translates to:
  /// **'Requested'**
  String get status_requested;

  /// No description provided for @status_confirmed.
  ///
  /// In en, this message translates to:
  /// **'Confirmed by lab'**
  String get status_confirmed;

  /// No description provided for @status_collected.
  ///
  /// In en, this message translates to:
  /// **'Sample collected'**
  String get status_collected;

  /// No description provided for @status_report_ready.
  ///
  /// In en, this message translates to:
  /// **'Report ready'**
  String get status_report_ready;

  /// No description provided for @status_cancelled.
  ///
  /// In en, this message translates to:
  /// **'Cancelled'**
  String get status_cancelled;

  /// No description provided for @status_booked.
  ///
  /// In en, this message translates to:
  /// **'Token booked'**
  String get status_booked;

  /// No description provided for @status_seen.
  ///
  /// In en, this message translates to:
  /// **'Seen by doctor'**
  String get status_seen;

  /// No description provided for @status_no_show.
  ///
  /// In en, this message translates to:
  /// **'Did not come'**
  String get status_no_show;

  /// No description provided for @profile_title.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile_title;

  /// No description provided for @profile_family.
  ///
  /// In en, this message translates to:
  /// **'Family members'**
  String get profile_family;

  /// No description provided for @profile_noFamily.
  ///
  /// In en, this message translates to:
  /// **'No family members added yet.'**
  String get profile_noFamily;

  /// No description provided for @profile_add.
  ///
  /// In en, this message translates to:
  /// **'Add member'**
  String get profile_add;

  /// No description provided for @profile_age.
  ///
  /// In en, this message translates to:
  /// **'Age'**
  String get profile_age;

  /// No description provided for @profile_relation.
  ///
  /// In en, this message translates to:
  /// **'Relation'**
  String get profile_relation;

  /// No description provided for @profile_relationPh.
  ///
  /// In en, this message translates to:
  /// **'Mother, Father, Son…'**
  String get profile_relationPh;

  /// No description provided for @profile_gender.
  ///
  /// In en, this message translates to:
  /// **'Gender'**
  String get profile_gender;

  /// No description provided for @profile_male.
  ///
  /// In en, this message translates to:
  /// **'Male'**
  String get profile_male;

  /// No description provided for @profile_female.
  ///
  /// In en, this message translates to:
  /// **'Female'**
  String get profile_female;

  /// No description provided for @profile_other.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get profile_other;

  /// No description provided for @profile_remove.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get profile_remove;

  /// No description provided for @profile_saved.
  ///
  /// In en, this message translates to:
  /// **'Saved ✓'**
  String get profile_saved;

  /// No description provided for @day_Mon.
  ///
  /// In en, this message translates to:
  /// **'Monday'**
  String get day_Mon;

  /// No description provided for @day_Tue.
  ///
  /// In en, this message translates to:
  /// **'Tuesday'**
  String get day_Tue;

  /// No description provided for @day_Wed.
  ///
  /// In en, this message translates to:
  /// **'Wednesday'**
  String get day_Wed;

  /// No description provided for @day_Thu.
  ///
  /// In en, this message translates to:
  /// **'Thursday'**
  String get day_Thu;

  /// No description provided for @day_Fri.
  ///
  /// In en, this message translates to:
  /// **'Friday'**
  String get day_Fri;

  /// No description provided for @day_Sat.
  ///
  /// In en, this message translates to:
  /// **'Saturday'**
  String get day_Sat;

  /// No description provided for @day_Sun.
  ///
  /// In en, this message translates to:
  /// **'Sunday'**
  String get day_Sun;

  /// No description provided for @date_today.
  ///
  /// In en, this message translates to:
  /// **'Today'**
  String get date_today;

  /// No description provided for @date_tomorrow.
  ///
  /// In en, this message translates to:
  /// **'Tomorrow'**
  String get date_tomorrow;

  /// No description provided for @slot_1.
  ///
  /// In en, this message translates to:
  /// **'6–8 am'**
  String get slot_1;

  /// No description provided for @slot_2.
  ///
  /// In en, this message translates to:
  /// **'8–10 am'**
  String get slot_2;

  /// No description provided for @slot_3.
  ///
  /// In en, this message translates to:
  /// **'10 am–12 pm'**
  String get slot_3;

  /// No description provided for @landing_t1.
  ///
  /// In en, this message translates to:
  /// **'Home sample pickup'**
  String get landing_t1;

  /// No description provided for @landing_t2.
  ///
  /// In en, this message translates to:
  /// **'Private reports'**
  String get landing_t2;

  /// No description provided for @landing_t3.
  ///
  /// In en, this message translates to:
  /// **'Same price as the lab'**
  String get landing_t3;

  /// No description provided for @landing_howTitle.
  ///
  /// In en, this message translates to:
  /// **'How it works'**
  String get landing_howTitle;

  /// No description provided for @receipt_title.
  ///
  /// In en, this message translates to:
  /// **'Doctor token receipt'**
  String get receipt_title;

  /// No description provided for @receipt_patient.
  ///
  /// In en, this message translates to:
  /// **'Patient'**
  String get receipt_patient;

  /// No description provided for @receipt_doctor.
  ///
  /// In en, this message translates to:
  /// **'Doctor'**
  String get receipt_doctor;

  /// No description provided for @receipt_clinic.
  ///
  /// In en, this message translates to:
  /// **'Clinic'**
  String get receipt_clinic;

  /// No description provided for @receipt_when.
  ///
  /// In en, this message translates to:
  /// **'When'**
  String get receipt_when;

  /// No description provided for @receipt_payAtClinic.
  ///
  /// In en, this message translates to:
  /// **'pay at clinic'**
  String get receipt_payAtClinic;

  /// No description provided for @receipt_code.
  ///
  /// In en, this message translates to:
  /// **'Visit code'**
  String get receipt_code;

  /// No description provided for @receipt_codeHint.
  ///
  /// In en, this message translates to:
  /// **'Show this receipt and code to the doctor at the clinic. The visit is complete only after the code is given.'**
  String get receipt_codeHint;

  /// No description provided for @receipt_print.
  ///
  /// In en, this message translates to:
  /// **'Print / save'**
  String get receipt_print;

  /// No description provided for @receipt_show.
  ///
  /// In en, this message translates to:
  /// **'Show receipt'**
  String get receipt_show;

  /// No description provided for @receipt_hide.
  ///
  /// In en, this message translates to:
  /// **'Hide receipt'**
  String get receipt_hide;

  /// No description provided for @landing_s1.
  ///
  /// In en, this message translates to:
  /// **'Pick tests and a lab, enter your address. The collector takes the sample at home and you confirm with your OTP.'**
  String get landing_s1;

  /// No description provided for @landing_s2.
  ///
  /// In en, this message translates to:
  /// **'The report shows up on your phone as soon as it\'s ready. Only you, the lab and your doctor can see it.'**
  String get landing_s2;

  /// No description provided for @landing_s3.
  ///
  /// In en, this message translates to:
  /// **'Pick a doctor and take a token from home. Go only when it\'s your turn.'**
  String get landing_s3;

  /// No description provided for @landing_whyTitle.
  ///
  /// In en, this message translates to:
  /// **'Why NidaanSetu?'**
  String get landing_whyTitle;

  /// No description provided for @landing_w1.
  ///
  /// In en, this message translates to:
  /// **'Home sample pickup'**
  String get landing_w1;

  /// No description provided for @landing_w1s.
  ///
  /// In en, this message translates to:
  /// **'Save the fare and the day lost travelling to town.'**
  String get landing_w1s;

  /// No description provided for @landing_w2.
  ///
  /// In en, this message translates to:
  /// **'Same price as the lab'**
  String get landing_w2;

  /// No description provided for @landing_w2s.
  ///
  /// In en, this message translates to:
  /// **'The lab\'s own counter price. No hidden charges.'**
  String get landing_w2s;

  /// No description provided for @landing_w3.
  ///
  /// In en, this message translates to:
  /// **'Private reports'**
  String get landing_w3;

  /// No description provided for @landing_w3s.
  ///
  /// In en, this message translates to:
  /// **'Only you, the lab and your doctor can see your report.'**
  String get landing_w3s;

  /// No description provided for @landing_w4.
  ///
  /// In en, this message translates to:
  /// **'Doctor tokens'**
  String get landing_w4;

  /// No description provided for @landing_w4s.
  ///
  /// In en, this message translates to:
  /// **'No long queues. Book a token from home and go on time.'**
  String get landing_w4s;

  /// No description provided for @landing_popTitle.
  ///
  /// In en, this message translates to:
  /// **'Common tests'**
  String get landing_popTitle;

  /// No description provided for @landing_popSub.
  ///
  /// In en, this message translates to:
  /// **'Prices differ by lab. Create an account to see rates from labs near your village.'**
  String get landing_popSub;

  /// No description provided for @landing_ctaTitle.
  ///
  /// In en, this message translates to:
  /// **'Book your first test today'**
  String get landing_ctaTitle;

  /// No description provided for @landing_ctaSub.
  ///
  /// In en, this message translates to:
  /// **'Creating an account takes a minute. Just your mobile number.'**
  String get landing_ctaSub;

  /// No description provided for @landing_card1.
  ///
  /// In en, this message translates to:
  /// **'Sample collected'**
  String get landing_card1;

  /// No description provided for @landing_card2.
  ///
  /// In en, this message translates to:
  /// **'Report is ready'**
  String get landing_card2;

  /// No description provided for @landing_card3.
  ///
  /// In en, this message translates to:
  /// **'Tomorrow, 7 AM'**
  String get landing_card3;

  /// No description provided for @landing_footTag.
  ///
  /// In en, this message translates to:
  /// **'The bridge between villages and care. Siwan, Bihar.'**
  String get landing_footTag;

  /// No description provided for @landing_ctaBtn.
  ///
  /// In en, this message translates to:
  /// **'Get started'**
  String get landing_ctaBtn;

  /// No description provided for @flow_s1.
  ///
  /// In en, this message translates to:
  /// **'Pick a lab'**
  String get flow_s1;

  /// No description provided for @flow_s2.
  ///
  /// In en, this message translates to:
  /// **'Pick tests'**
  String get flow_s2;

  /// No description provided for @flow_s3.
  ///
  /// In en, this message translates to:
  /// **'Address & day'**
  String get flow_s3;

  /// No description provided for @flow_label.
  ///
  /// In en, this message translates to:
  /// **'Booking steps'**
  String get flow_label;

  /// No description provided for @lang_label.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get lang_label;

  /// No description provided for @err_name.
  ///
  /// In en, this message translates to:
  /// **'Enter a name'**
  String get err_name;

  /// No description provided for @err_address.
  ///
  /// In en, this message translates to:
  /// **'Enter your home address'**
  String get err_address;

  /// No description provided for @err_consent.
  ///
  /// In en, this message translates to:
  /// **'Tick this to continue'**
  String get err_consent;

  /// No description provided for @err_phone.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid 10-digit mobile number'**
  String get err_phone;

  /// No description provided for @err_email.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email'**
  String get err_email;

  /// No description provided for @err_loginBoth.
  ///
  /// In en, this message translates to:
  /// **'Enter both mobile/email and password'**
  String get err_loginBoth;

  /// No description provided for @profile_mobileHint.
  ///
  /// In en, this message translates to:
  /// **'To change your mobile number, contact a NidaanSetu agent'**
  String get profile_mobileHint;

  /// No description provided for @profile_emailHint.
  ///
  /// In en, this message translates to:
  /// **'A reset link comes to this email if you forget your password'**
  String get profile_emailHint;

  /// No description provided for @nav_doctor.
  ///
  /// In en, this message translates to:
  /// **'Doctor'**
  String get nav_doctor;

  /// No description provided for @nav_booking.
  ///
  /// In en, this message translates to:
  /// **'Booking'**
  String get nav_booking;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'hi'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'hi':
      return AppLocalizationsHi();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
