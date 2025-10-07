import { Modal } from 'components/atoms/Modal';
import { UserOwnedDomain } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import S from './styles';
import { Button } from 'components/atoms/Button';

const ConfirmUnassignModal = (props: {
	confirmUnassignModal: { open: boolean; domain?: UserOwnedDomain };
	setConfirmUnassignModal: React.Dispatch<React.SetStateAction<{ open: boolean; domain?: UserOwnedDomain }>>;
	unassignDomainFromPortal: (domain: UserOwnedDomain) => Promise<void>;
}) => {
	const languageProvider = useLanguageProvider();
	const language: any = languageProvider.object[languageProvider.current];
	return (
		<Modal
			header={language.removeAssignmentConfirm || 'Remove Domain Assignment'}
			handleClose={() => props.setConfirmUnassignModal({ open: false })}
			className={'modal-wrapper'}
		>
			{props.confirmUnassignModal.domain && (
				<S.ModalWrapper>
					<S.ModalSection>
						<S.ModalSectionTitle>Domain</S.ModalSectionTitle>
						<S.ModalSectionContent>{props.confirmUnassignModal.domain.name}</S.ModalSectionContent>
					</S.ModalSection>
					<S.ModalSection>
						<p>{language.removeAssignmentConfirmMessage}</p>
					</S.ModalSection>
					<S.ModalActions>
						<Button
							type={'primary'}
							label={language.cancel}
							handlePress={() => props.setConfirmUnassignModal({ open: false })}
						/>
						<Button
							type={'alt1'}
							label={language.confirm}
							handlePress={() => {
								props.setConfirmUnassignModal({ open: false });
								if (props.confirmUnassignModal.domain) {
									props.unassignDomainFromPortal(props.confirmUnassignModal.domain);
								}
							}}
						/>
					</S.ModalActions>
				</S.ModalWrapper>
			)}
		</Modal>
	);
};

export default ConfirmUnassignModal;
