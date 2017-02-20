# Convoy API

This simple library exposes the [Convoy](https://github.com/rancher/convoy) api so you can
write node scripts that manage docker container data volumes.

## Usage

```javascript
"use strict";

let Convoy = require( 'node-convoy' );
let convoy = new Convoy( "/var/run/convoy/convoy.sock" );

convoy.snapshotCreate({
  Name: "snap1",
  VolumeName: "data-volume"
}, function( err, result ) {
  if ( err ) {
    console.error( "Could not create a snapshot:", err );
    process.exit(1);
  }
  convoy.backupCreate({
    URL: "s3://my-backups-bucket@us-west-2/",
    SnapshotName: "snap1"
  }, function( err, result ) {
       if ( err ) {
         console.error( "Could not create a backup:", err );
         process.exit(1);
       }
       console.log( "Backup successful.  BackupURL:", result.URL );
       process.exit(0);
  });
});
```

## API

### info( cb ) - get general driver information
**returns something like**
```javascript
{
  "General": {
    "Root": "/var/lib/rancher/convoy",
    "DriverList": [
      "devicemapper"
    ],
    "DefaultDriver": "devicemapper",
    "MountNamespaceFD": "",
    "IgnoreDockerDelete": false,
    "CreateOnDockerMount": false,
    "CmdTimeout": ""
  },
  "devicemapper": {
    "DataDevice": "/dev/xvdh1",
    "DefaultVolumeSize": "107374182400",
    "Driver": "devicemapper",
    "Filesystem": "ext4",
    "MetadataDevice": "/dev/xvdh2",
    "Root": "/var/lib/rancher/convoy/devicemapper",
    "ThinpoolBlockSize": "2097152",
    "ThinpoolDevice": "/dev/mapper/convoy-pool",
    "ThinpoolSize": "107330507264"
  }
}
```

### volumes( cb ) - list all volumes
**returns something like**
```javascript
{
  "test_volume": {
    "Name": "test_volume",
    "Driver": "devicemapper",
    "MountPoint": "/var/lib/rancher/convoy/devicemapper/mounts/test_volume",
    "CreatedTime": "Sun Feb 19 19:40:31 +0000 2017",
    "DriverInfo": {
      "DevID": "1",
      "Device": "/dev/mapper/test_volume",
      "Driver": "devicemapper",
      "Filesystem": "ext4",
      "MountPoint": "/var/lib/rancher/convoy/devicemapper/mounts/test_volume",
      "Size": "107374182400",
      "VolumeCreatedAt": "Sun Feb 19 19:40:31 +0000 2017",
      "VolumeName": "test_volume"
    },
    "Snapshots": {
      "snap1": {
        "Name": "snap1",
        "CreatedTime": "Sun Feb 19 20:00:13 +0000 2017",
        "DriverInfo": {
          "DevID": "2",
          "Driver": "devicemapper",
          "Size": "107374182400",
          "SnapshotCreatedAt": "Sun Feb 19 20:00:13 +0000 2017",
          "SnapshotName": "snap1",
          "UUID": "snap1",
          "VolumeUUID": "test_volume"
        }
      },
      "snap2": {
        "Name": "snap2",
        "CreatedTime": "Sun Feb 19 20:21:27 +0000 2017",
        "DriverInfo": {
          "DevID": "3",
          "Driver": "devicemapper",
          "Size": "107374182400",
          "SnapshotCreatedAt": "Sun Feb 19 20:21:27 +0000 2017",
          "SnapshotName": "snap2",
          "UUID": "snap2",
          "VolumeUUID": "test_volume"
        }
      }
    }
  }
}
```

### volumeCreate( args, cb )
```javascript
{
  Name           string
  DriverName     string (eg: ebs, devicemapper, vfs)
  Size           string (eg: "40G", "500M")
  BackupURL      string (create a volume from a backup)
  DriverVolumeID string (??)
  Type           string (driver-specific type)
  IOPS           int64  (only used for ebs, type=io1)
  PrepareForVM   bool   (??)
}
```
**returns something like**
```javascript
{
  "Name": "vol2",
  "Driver": "devicemapper",
  "MountPoint": "",
  "CreatedTime": "Mon Feb 20 06:57:46 +0000 2017",
  "DriverInfo": {
    "DevID": "7",
    "Device": "/dev/mapper/vol2",
    "Driver": "devicemapper",
    "Filesystem": "ext4",
    "MountPoint": "",
    "Size": "42949672960",
    "VolumeCreatedAt": "Mon Feb 20 06:57:46 +0000 2017",
    "VolumeName": "vol2"
  },
  "Snapshots": {}
}
```

### volumeInspect( args, cb )
```javascript
{ 
  VolumeName string
}
```
**returns something like**
```javascript
{
  "Name": "vol2",
  "Driver": "devicemapper",
  "MountPoint": "/mnt",
  "CreatedTime": "Mon Feb 20 06:57:46 +0000 2017",
  "DriverInfo": {
    "DevID": "7",
    "Device": "/dev/mapper/vol2",
    "Driver": "devicemapper",
    "Filesystem": "ext4",
    "MountPoint": "/mnt",
    "Size": "42949672960",
    "VolumeCreatedAt": "Mon Feb 20 06:57:46 +0000 2017",
    "VolumeName": "vol2"
  },
  "Snapshots": {}
}
```

### volumeDelete( args, cb )
```javascript
{
  VolumeName    string
  ReferenceOnly bool
}
```
**returns null**

### snapshotCreate( args, cb )
```javascript
{
  Name       string
  VolumeName string
}
```
**returns something like**
```javascript
{
  "Name": "snap6",
  "VolumeName": "test_volume",
  "CreatedTime": "Mon Feb 20 18:44:03 +0000 2017",
  "DriverInfo": {
    "DevID": "9",
    "Driver": "devicemapper",
    "Size": "107374182400",
    "SnapshotCreatedAt": "Mon Feb 20 18:44:03 +0000 2017",
    "SnapshotName": "snap6",
    "UUID": "snap6",
    "VolumeUUID": "test_volume"
  }
}
```

### snapshotInspect( args, cb )
```javascript
{
  SnapshotName string
}
```
**returns something like**
```javascript
{
  "Name": "snap6",
  "VolumeName": "test_volume",
  "VolumeCreatedAt": "Sun Feb 19 19:40:31 +0000 2017",
  "CreatedTime": "Mon Feb 20 18:44:03 +0000 2017",
  "DriverInfo": {
    "DevID": "9",
    "Driver": "devicemapper",
    "Size": "107374182400",
    "SnapshotCreatedAt": "Mon Feb 20 18:44:03 +0000 2017",
    "SnapshotName": "snap6",
    "UUID": "snap6",
    "VolumeUUID": "test_volume"
  }
}
```

### snapshotDelete( args, cb )
```javascript
{
  SnapshotName string
}
```
**returns null**

### backupCreate( args, cb )
```javascript
{
  URL          string
  SnapshotName string
}
```
**returns something like**
```javascript
{
  "URL": "s3://my-backups-bucket@us-west-2/?backup=backup-578ba7d9b82c4574&volume=test_volume"
}
```

### backups( args, cb ) - list all backups
```javascript
{
  URL          string
  VolumeName   string (optional)
  SnapshotName string (optional)
}
```
**returns something like**
```javascript
{
  "s3://my-backups-bucket@us-west-2/?backup=backup-00ff9d4370f74e5b&volume=test_volume": {
    "BackupName": "backup-00ff9d4370f74e5b",
    "BackupURL": "s3://my-backups-bucket@us-west-2/?backup=backup-00ff9d4370f74e5b&volume=test_volume",
    "CreatedTime": "Sun Feb 19 00:40:18 +0000 2017",
    "DriverName": "devicemapper",
    "SnapshotCreatedAt": "Sun Feb 19 00:38:06 +0000 2017",
    "SnapshotName": "snap1",
    "VolumeCreatedAt": "Sat Feb 18 22:13:14 +0000 2017",
    "VolumeName": "test_volume",
    "VolumeSize": "107374182400"
  },
  "s3://my-backups-bucket@us-west-2/?backup=backup-08b3d265f78f43c9&volume=test_volume": {
    "BackupName": "backup-08b3d265f78f43c9",
    "BackupURL": "s3://my-backups-bucket@us-west-2/?backup=backup-08b3d265f78f43c9&volume=test_volume",
    "CreatedTime": "Sun Feb 19 20:21:49 +0000 2017",
    "DriverName": "devicemapper",
    "SnapshotCreatedAt": "Sun Feb 19 20:21:27 +0000 2017",
    "SnapshotName": "snap2",
    "VolumeCreatedAt": "Sat Feb 18 22:13:14 +0000 2017",
    "VolumeName": "test_volume",
    "VolumeSize": "107374182400"
  }
}
```

### backupDelete( args, cb )
```javascript
{
  URL string
}
```
**returns null**

