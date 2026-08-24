from pathlib import Path
import importlib.util
import sys
import unittest

MODULE_PATH = Path(__file__).parents[1] / "queue_runner.py"
spec = importlib.util.spec_from_file_location("queue_runner", MODULE_PATH)
queue_runner = importlib.util.module_from_spec(spec)
assert spec and spec.loader
sys.modules[spec.name] = queue_runner
spec.loader.exec_module(queue_runner)


class DryRunTests(unittest.TestCase):
    def test_seed_is_valid_for_dry_run(self):
        seed = Path(__file__).parents[1] / "seed" / "exported-queue.json"
        items = queue_runner.load_seed(seed)
        self.assertEqual(len(items), 5)
        for item in items:
            self.assertEqual(queue_runner.validate_item(item, live=False), [])
            self.assertEqual(item["approval_status"], "awaiting_approval")

    def test_live_requires_media_and_approval(self):
        item = {
            "source_key": "test",
            "caption": "Caption",
            "platforms": ["instagram", "facebook"],
            "hashtags": [],
            "approval_status": "awaiting_approval",
        }
        errors = queue_runner.validate_item(item, live=True)
        self.assertIn("approval_status must be approved for live publication", errors)
        self.assertIn("media_url is required for live publication", errors)


if __name__ == "__main__":
    unittest.main()
