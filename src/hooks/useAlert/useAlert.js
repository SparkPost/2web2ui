import { useDispatch } from 'react-redux';
import { showAlert as _showAlert, clear as _clearAlert } from 'src/actions/globalAlert';

/**
 * @description used to render or clear snackbar UI
 */
export default function useAlert() {
  const dispatch = useDispatch();

  const showAlert = ({ type, message }) => dispatch(_showAlert({ type, message }));

  const clearAlert = id => dispatch(_clearAlert(id));

  return { showAlert, clearAlert };
}
