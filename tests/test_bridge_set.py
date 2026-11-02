import pytest
from unittest.mock import patch, MagicMock
from parallel.bridge_client import create_bridge_user_set
from parallel.profiles import create_profile, _profile_path, profile_exists

def test_create_bridge_user_set_mocked():
    with patch("parallel.bridge_client.login_device", return_value=("test-session-id", "919999999999")):
        with patch("requests.post") as mock_post:
            # Simulate 1026 Set Created
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = {
                "ErrorCode": 1026,
                "ErrorMessage": {"SetName": "Set_testuser", "Message": "Set_testuser Set Created"}
            }
            mock_post.return_value = mock_resp

            res = create_bridge_user_set("testuser")
            assert res["success"] is True
            assert res["created"] is True
            assert res["set_name"] == "Set_testuser"

def test_create_bridge_user_set_already_exists_mocked():
    with patch("parallel.bridge_client.login_device", return_value=("test-session-id", "919999999999")):
        with patch("requests.post") as mock_post:
            # Simulate 1025 Set Already Exists
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = {
                "ErrorCode": 1025,
                "ErrorMessage": "Set_existing Already exists"
            }
            mock_post.return_value = mock_resp

            res = create_bridge_user_set("existing")
            assert res["success"] is True
            assert res["created"] is False
            assert res["already_existed"] is True
            assert res["set_name"] == "Set_existing"

def test_signup_creates_profile_with_bridge_set():
    test_user = "temp_unit_test_user_xyz"
    p = _profile_path(test_user)
    if p.exists():
        p.unlink()

    with patch("parallel.bridge_client.create_bridge_user_set") as mock_bridge:
        mock_bridge.return_value = {
            "success": True,
            "created": True,
            "set_name": f"Set_{test_user}"
        }
        prof = create_profile(test_user, "9999")
        assert prof["username"] == test_user
        assert prof["bridge_set"] == f"Set_{test_user}"
        assert prof["bridge_sync"]["status"] == "active"
        assert prof["bridge_sync"]["set_name"] == f"Set_{test_user}"

    # Clean up
    if p.exists():
        p.unlink()
