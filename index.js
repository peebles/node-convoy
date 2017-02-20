"use strict";

let request = require( 'request' );
  
class Convoy {
  constructor( url ) {
    this.opts = {};
    this.opts.convoySocket = url || "/var/run/convoy/convoy.sock"
  }

  _request( method, url, data, cb ) {
    request({
      url: 'http://unix:' + this.opts.convoySocket+':'+url,
      headers:{
	host: require( 'os' ).hostname(), // request() sets host to the socket path, which convoy daemon does not like.
      },
      method: method,
      json: data,
    }, ( err, res, body ) => {
      if ( err ) return cb( err );
      if ( res.statusCode >= 300 ) {
	let msg = res.statusMessage;
	if ( body ) {
	  if ( typeof body == 'object' )
	    msg = JSON.stringify( body );
	  else
	    msg = body;
	}
	return cb( new Error( msg ) );
      }
      if ( ! body ) return cb();
      if ( typeof body == 'object' )
	return cb( null, body );
      else
	return cb( null, JSON.parse( body ) );
    });
  }

  // PROBABLY NOT SUPPOSED TO EXPOSE THIS TO THE PUBLIC
  volumeMount( args, cb ) {
    // {
    //   VolumeName string
    //   MountPoint string
    // }
    args.Verbose = true; // or you don't get JSON response
    this._request( 'POST', '/volumes/mount', args, cb );
  }

  // PROBABLY NOT SUPPOSED TO EXPOSE THIS TO THE PUBLIC
  volumeUnmount( args, cb ) {
    // {
    //   VolumeName string
    // }
    this._request( 'POST', '/volumes/unmount', args, cb );
  }

  volumeCreate( args, cb ) {
    // {
    //   Name           string
    //   DriverName     string (eg: ebs, devicemapper, vfs)
    //   Size           string (eg: "40G", "500M" or "107374182400")
    //   BackupURL      string (create a volume from a backup)
    //   DriverVolumeID string (??)
    //   Type           string (driver-specific type)
    //   IOPS           int64  (only used for ebs, type=io1)
    //   PrepareForVM   bool   (??)
    // }
    args.Verbose = true; // or you don't get JSON response
    if ( args.Size ) {
      if ( ! args.Size.match( /^[0-9]+$/ ) ) {
	let m = args.Size.toLowerCase().match( /^([0-9]+)([kmgt])$/ );
	if ( ! m ) return cb( new Error( 'Size format not recognized: must be a string like "40G"' ) );
	let size = Number( m[1] );
	let kb = 1024;
	let mb = 1024 * kb;
	let gb = 1024 * mb;
	let tb = 1024 * gb;
	switch( m[2] ) {
	  case 'k': size *= kb; break;
	  case 'm': size *= mb; break;
	  case 'g': size *= gb; break;
	  case 't': size *= tb; break;
	}
	args.Size = size;
      }
      else {
	args.Size = Number( args.Size );
      }
    }
    this._request( 'POST', '/volumes/create', args, cb );
  }

  volumeDelete( args, cb ) {
    // {
    //   VolumeName    string
    //   ReferenceOnly bool
    // }
    this._request( 'DELETE', '/volumes/', args, cb );
  }

  volumeInspect( args, cb ) {
    // { 
    //   VolumeName string
    // }
    this._request( 'GET', '/volumes/', args, cb );
  }

  snapshotCreate( args, cb ) {
    // {
    //   Name       string
    //   VolumeName string
    // }
    args.Verbose = true; // or you don't get JSON response
    this._request( 'POST', '/snapshots/create', args, cb );
  }

  snapshotDelete( args, cb ) {
    // {
    //   SnapshotName string
    // }
    this._request( 'DELETE', '/snapshots/', args, cb );
  }

  snapshotInspect( args, cb ) {
    // {
    //   SnapshotName string
    // }
    this._request( 'GET', '/snapshots/', args, cb );
  }

  backupCreate( args, cb ) {
    // {
    //   URL          string
    //   SnapshotName string
    // }
    args.Verbose = true; // or you don't get JSON response
    this._request( 'POST', '/backups/create', args, cb );
  }

  backupDelete( args, cb ) {
    // {
    //   URL string
    // }
    this._request( 'DELETE', '/backups', args, cb );
  }

  info( cb ) {
    this._request( 'GET', '/info', {}, cb );
  }

  volumes( cb ) {
    this._request( 'GET', '/volumes/list', {}, cb );
  }

  backups( args, cb ) {
    // {
    //   URL          string
    //   VolumeName   string (optional)
    //   SnapshotName string (optional)
    // }
    this._request( 'GET', '/backups/list', args, cb );
  }
  
}

module.exports = Convoy;

