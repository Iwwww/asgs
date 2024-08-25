from django.db import migrations


def create_user_groups(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    group_names = ["admin", "factory", "sale_point", "carrier"]

    for group_name in group_names:
        if not Group.objects.filter(name=group_name).exists():
            Group.objects.create(name=group_name)


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0003_factoryuser"),
    ]

    operations = [
        migrations.RunPython(create_user_groups),
    ]
