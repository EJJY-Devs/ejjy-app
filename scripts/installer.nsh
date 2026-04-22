!macro customInstall
  DetailPrint "Installing Python dependencies..."
  nsExec::ExecToLog '"python" -m pip install -r "$INSTDIR\resources\api\requirements.txt"'
  Pop $0
  ${If} $0 != 0
    MessageBox MB_OK|MB_ICONEXCLAMATION "Python dependency installation failed (exit code: $0). Make sure Python is installed and try reinstalling."
  ${EndIf}
!macroend
