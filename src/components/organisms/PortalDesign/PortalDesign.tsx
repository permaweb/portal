import { Button } from 'components/atoms/Button';
import { ASSETS } from 'helpers/config';

import * as S from './styles';

// TODO
export default function PortalDesign() {
	return (
		<S.Wrapper>
			<S.ActionWrapper>
				<Button type={'primary'} label={'Colors'} handlePress={() => {}} icon={ASSETS.arrow} height={40} fullWidth />
			</S.ActionWrapper>
			<S.ActionWrapper>
				<Button type={'primary'} label={'Fonts'} handlePress={() => {}} icon={ASSETS.arrow} height={40} fullWidth />
			</S.ActionWrapper>
			<S.ActionWrapper>
				<Button type={'primary'} label={'Site Logo'} handlePress={() => {}} icon={ASSETS.arrow} height={40} fullWidth />
			</S.ActionWrapper>
		</S.Wrapper>
	);
}
