import * as S from './styles';

// TODO: Use portal post data
// TODO: Render based on layout prop
// TODO: Allow change layout
export default function FeedBlock(props: { block: any }) {
	return (
		<S.Wrapper>
			<S.CategoryWrapper>
				<S.CategoryHeader>
					<p>Arweave</p>
				</S.CategoryHeader>
				<S.CategoryBody>
					<S.PostWrapper>
						<S.PostInfo>
							<p>How Arweave’s storage endowment ensures permanent data storage</p>
							<span>
								Since Arweave’s launch seven years ago, not a single token has been reissued from the endowment. This
								means the token supply continues to shrink as usage increases. Learn more about the storage endowment in
								this article.
							</span>
						</S.PostInfo>
						{props.block?.layout === 'journal' && (
							<S.PostImage>
								<img
									src={
										'https://t6nx4suobmbhecmiulx67ivgvbodi75egwlyiokfzull57nps6na.arweave.net/n5t-So4LAnIJiKLv76KmqFw0f6Q1l4Q5Rc0Wvv2vl5o'
									}
								/>
							</S.PostImage>
						)}
					</S.PostWrapper>
				</S.CategoryBody>
			</S.CategoryWrapper>
		</S.Wrapper>
	);
}
