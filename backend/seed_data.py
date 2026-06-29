"""Seed script to populate initial data for development."""

from datetime import datetime, timezone

from app.core.database import SessionLocal, init_db
from app.core.security import get_password_hash
from app.models.membership import Membership
from app.models.user import User


def seed_database():
    """Populate database with initial data."""
    db = SessionLocal()

    try:
        # Create admin user
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                display_name="系统管理员",
                is_superuser=True,
                is_active=True,
            )
            db.add(admin)
            print("✓ 管理员账户已创建 (admin / admin123)")

        # Create demo user
        demo = db.query(User).filter(User.username == "demo").first()
        if not demo:
            demo = User(
                username="demo",
                email="demo@example.com",
                hashed_password=get_password_hash("demo123"),
                display_name="演示用户",
                is_active=True,
            )
            db.add(demo)
            print("✓ 演示账户已创建 (demo / demo123)")

        db.flush()

        # Create membership plans
        plans_data = [
            {
                "name": "免费版",
                "description": "基础功能，适合入门学习",
                "price": 0,
                "duration_days": 9999,
                "max_prompts_per_day": 3,
                "max_score_queries": 1,
                "can_use_ai_scoring": False,
                "can_export_reports": False,
                "priority_support": False,
            },
            {
                "name": "专业版",
                "description": "更多功能，适合进阶用户，每天可创建20个提示词，支持AI评分",
                "price": 29.99,
                "duration_days": 30,
                "max_prompts_per_day": 20,
                "max_score_queries": 10,
                "can_use_ai_scoring": True,
                "can_export_reports": True,
                "priority_support": False,
            },
            {
                "name": "企业版",
                "description": "全部功能无限制，适合团队使用，优先客服支持",
                "price": 99.99,
                "duration_days": 30,
                "max_prompts_per_day": 100,
                "max_score_queries": 50,
                "can_use_ai_scoring": True,
                "can_export_reports": True,
                "priority_support": True,
            },
            {
                "name": "年度专业版",
                "description": "专业版年度订阅，节省30%费用",
                "price": 249.99,
                "duration_days": 365,
                "max_prompts_per_day": 20,
                "max_score_queries": 10,
                "can_use_ai_scoring": True,
                "can_export_reports": True,
                "priority_support": False,
            },
        ]

        for plan_data in plans_data:
            existing = (
                db.query(Membership)
                .filter(Membership.name == plan_data["name"])
                .first()
            )
            if not existing:
                plan = Membership(**plan_data)
                db.add(plan)
                print(f"✓ 会员方案已创建: {plan_data['name']}")

        db.commit()
        print("\n✅ 数据库初始化完成！")
        print("=" * 40)
        print("管理员账户: admin / admin123")
        print("演示账户:   demo / demo123")
        print("=" * 40)

    except Exception as e:
        db.rollback()
        print(f"❌ 初始化失败: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🔄 正在初始化数据库...")
    init_db()
    seed_database()
