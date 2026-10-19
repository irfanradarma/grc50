// Browsing changes only this viewer; presenter updates never re-enable following.
export function createFollowState(initial='cover'){
 let following=true,presenter=null,local=initial;
 return {
  get following(){return following;},get presenter(){return presenter;},get local(){return local;},
  browse(key=local){following=false;local=key;},
  receive(key){presenter=key;if(following){local=key;return key;}return null;},
  resume(){following=true;if(presenter)local=presenter;return local;}
 };
}
