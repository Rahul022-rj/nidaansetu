import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/api/api_error.dart';
import '../core/auth/auth_controller.dart';
import '../core/utils/json_map.dart';

class PublicRepo {
  final Dio _dio;
  PublicRepo(this._dio);

  Future<List<JsonMap>> getVillages({String? query}) async {
    try {
      final res = await _dio.get(
        '/villages',
        queryParameters: {
          if (query != null && query.trim().isNotEmpty) 'q': query.trim(),
          'limit': 100,
        },
      );
      return asJsonMapList(res.data['data']);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<List<JsonMap>> getLabs({String? villageId}) async {
    try {
      final res = await _dio.get(
        '/labs',
        queryParameters: {
          if (villageId != null && villageId.isNotEmpty) 'villageId': villageId,
        },
      );
      return asJsonMapList(res.data['data']);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<JsonMap> getLabTests(String labId, {String? query}) async {
    try {
      final res = await _dio.get(
        '/labs/$labId/tests',
        queryParameters: {
          if (query != null && query.trim().isNotEmpty) 'q': query.trim(),
        },
      );
      return asJsonMap(res.data);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }
}

final publicRepoProvider = Provider<PublicRepo>(
  (ref) => PublicRepo(ref.read(dioProvider)),
);