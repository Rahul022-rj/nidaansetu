import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';

import '../core/api/api_error.dart';
import '../core/auth/auth_controller.dart';
import '../core/utils/json_map.dart';

class PatientRepo {
  final Dio _dio;
  PatientRepo(this._dio);

  String _resolveFullUrl(String rawUrl) {
    var trimmed = rawUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed
          .replaceFirst('http://localhost:5173', 'http://localhost:5050')
          .replaceFirst('http://127.0.0.1:5173', 'http://localhost:5050');
    }
    final origin = _dio.options.baseUrl.replaceFirst(RegExp(r'/api/v1/?$'), '');
    return trimmed.startsWith('/') ? '$origin$trimmed' : '$origin/$trimmed';
  }

  Future<void> updateVillage(String villageId) async {
    try {
      await _dio.patch('/me', data: {'villageId': villageId});
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<List<JsonMap>> getFamilyMembers() async {
    try {
      final res = await _dio.get('/me/family');
      return asJsonMapList(res.data['data']);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<JsonMap> addFamilyMember({
    required String name,
    required String relation,
    int? age,
    String? gender,
  }) async {
    try {
      final res = await _dio.post(
        '/me/family',
        data: {
          'name': name.trim(),
          'relation': relation.trim(),
          if (age != null) 'age': age,
          if (gender != null && gender.trim().isNotEmpty)
            'gender': gender.trim(),
        },
      );
      final dataMap = asJsonMap(res.data);
      return asJsonMap(dataMap['member'] ?? dataMap['data'] ?? dataMap);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<List<JsonMap>> getDoctors({String? villageId, String? query}) async {
    try {
      final res = await _dio.get(
        '/doctors',
        queryParameters: {
          if (villageId != null && villageId.isNotEmpty) 'villageId': villageId,
          if (query != null && query.trim().isNotEmpty) 'q': query.trim(),
        },
      );
      return asJsonMapList(res.data['data']);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<JsonMap> getDoctorAvailability(
    String doctorId, {
    required String date,
  }) async {
    try {
      final res = await _dio.get(
        '/doctors/$doctorId/availability',
        queryParameters: {'date': date},
      );
      return asJsonMap(res.data);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<JsonMap> createAppointment({
    required String doctorId,
    required String date,
    required String slot,
    String? villageId,
    String? familyMemberId,
    String? notes,
  }) async {
    try {
      final res = await _dio.post(
        '/appointments',
        data: {
          'doctorId': doctorId,
          'date': date,
          'slot': slot,
          if (villageId != null && villageId.isNotEmpty) 'villageId': villageId,
          if (familyMemberId != null && familyMemberId.isNotEmpty)
            'familyMemberId': familyMemberId,
          if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
          'consent': true,
        },
      );
      final dataMap = asJsonMap(res.data);
      return asJsonMap(dataMap['appointment'] ?? dataMap['data'] ?? dataMap);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<List<JsonMap>> getMyAppointments({String? status}) async {
    try {
      final res = await _dio.get(
        '/me/appointments',
        queryParameters: {
          if (status != null && status.isNotEmpty) 'status': status,
        },
      );
      return asJsonMapList(res.data['data']);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<void> cancelAppointment(String appointmentId, {String? reason}) async {
    try {
      await _dio.post(
        '/appointments/$appointmentId/cancel',
        data: {
          if (reason != null && reason.trim().isNotEmpty)
            'reason': reason.trim(),
        },
      );
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<JsonMap> createBooking({
    required String labId,
    required List<String> testIds,
    String? villageId,
    String? familyMemberId,
    required String address,
    required String date,
    required String slot,
    required String paymentMode,
  }) async {
    try {
      final res = await _dio.post(
        '/bookings',
        data: {
          'labId': labId,
          'testIds': testIds,
          if (villageId != null && villageId.isNotEmpty) 'villageId': villageId,
          if (familyMemberId != null && familyMemberId.isNotEmpty)
            'familyMemberId': familyMemberId,
          'address': address.trim(),
          'date': date,
          'slot': slot,
          'paymentMode': paymentMode,
          'consent': true,
        },
      );
      final dataMap = asJsonMap(res.data);
      return asJsonMap(dataMap['booking'] ?? dataMap);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<List<JsonMap>> getMyBookings({String? status}) async {
    try {
      final res = await _dio.get(
        '/me/bookings',
        queryParameters: {
          if (status != null && status.isNotEmpty) 'status': status,
        },
      );
      return asJsonMapList(res.data['data']);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<void> cancelBooking(String bookingId, {String? reason}) async {
    try {
      await _dio.post(
        '/bookings/$bookingId/cancel',
        data: {
          if (reason != null && reason.trim().isNotEmpty)
            'reason': reason.trim(),
        },
      );
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<String> getReportSignedUrl(String bookingId) async {
    try {
      final res = await _dio.get('/bookings/$bookingId/report');
      final map = asJsonMap(res.data);
      final rawUrl =
          (map['url'] ??
                  map['signedUrl'] ??
                  map['downloadUrl'] ??
                  map['reportUrl'] ??
                  '')
              .toString()
              .trim();
      if (rawUrl.isEmpty) {
        throw const ApiError(
          code: 'NO_REPORT_URL',
          message: 'Report ka link nahi mila',
        );
      }
      return _resolveFullUrl(rawUrl);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<String> downloadReportToTempFile(
    String bookingId, {
    String? suggestedName,
  }) async {
    try {
      final url = await getReportSignedUrl(bookingId);
      final dir = await getTemporaryDirectory();
      final safeName =
          (suggestedName != null && suggestedName.trim().isNotEmpty)
          ? suggestedName.trim().replaceAll(RegExp(r'[^\w.\-]'), '_')
          : 'report_$bookingId';
      final savePath = '${dir.path}/$safeName';
      await _dio.download(url, savePath);
      final file = File(savePath);
      if (!await file.exists() || await file.length() == 0) {
        throw const ApiError(
          code: 'EMPTY_REPORT',
          message: 'Report file khali hai ya download nahi hui',
        );
      }
      return file.path;
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }
}

final patientRepoProvider = Provider<PatientRepo>(
  (ref) => PatientRepo(ref.read(dioProvider)),
);
