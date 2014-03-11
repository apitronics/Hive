# enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
      eval "`dircolors -b`"
      alias ls='ls --color=auto'
      #alias dir='dir --color=auto'
      #alias vdir='vdir --color=auto'
  
      #alias grep='grep --color=auto'
      #alias fgrep='fgrep --color=auto'
      #alias egrep='egrep --color=auto'
 fi
 
 # txtylw='\033[1;33m' # Yellow
 txtylw='\033[0;37m' # light grey
 # txtylw='\033[1;30m' # Yellow
 txtgrn='\033[0;33m' # Yellow
 fgcolor="\033[0m"    # unsets color to term's fg color
 twolevelprompt='$([ "$PWD" != "${PWD%/*/*/*}" ] && echo "/...${PWD##${PWD%/*/*}}" || echo "$PWD")'
 gitprompt='$(__git_ps1 "[%s]")'
 export PS1="\[$txtylw\] $twolevelprompt\[$fgcolor\]\[$txtgrn\]"' Η '"\[$fgcolor\]"
