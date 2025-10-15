import { Button } from 'components/atoms/Button';
import { Modal } from 'components/atoms/Modal';
import { UserOwnedDomain } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

const ConfirmAssignModal = (props: {
	confirmAssignModal: { open: boolean; domain?: UserOwnedDomain };
	setConfirmAssignModal: React.Dispatch<React.SetStateAction<{ open: boolean; domain?: UserOwnedDomain }>>;
	redirectDomainToPortal: (domain: UserOwnedDomain) => Promise<void>;
	redirectingDomains: Set<string>;
}) => {
	const languageProvider = useLanguageProvider();
	const language: any = languageProvider.object[languageProvider.current];

	return (
		<Modal
			header={language.confirmDomainAssignment}
			handleClose={() => props.setConfirmAssignModal({ open: false })}
			className={'modal-wrapper'}
		>
			{props.confirmAssignModal.domain && (
				<S.ModalWrapper>
					<S.ModalSection>
						<S.ModalSectionTitle>Domain</S.ModalSectionTitle>
						<S.ModalSectionContent>{props.confirmAssignModal.domain.name}</S.ModalSectionContent>
					</S.ModalSection>
					<S.ModalSection>
						<p>{language.confirmDomainAssignmentMessage}</p>
					</S.ModalSection>
					<S.ModalActions>
						<Button
							type={'primary'}
							label={language.cancel}
							handlePress={() => props.setConfirmAssignModal({ open: false })}
						/>
						<Button
							type={'alt1'}
							label={language.confirm}
							handlePress={() => {
								props.setConfirmAssignModal({ open: false });
								if (props.confirmAssignModal.domain) {
									props.redirectDomainToPortal(props.confirmAssignModal.domain);
								}
							}}
							disabled={props.redirectingDomains.has(props.confirmAssignModal.domain.name)}
						/>
					</S.ModalActions>
				</S.ModalWrapper>
			)}
		</Modal>
	);
};

export default ConfirmAssignModal;
