import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import { Loading, Owner, IssueList, IssueFilter, PageActions } from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                repository: PropTypes.string,
            }),
        }).isRequired,
    };

    state = {
        repository: {},
        issues: [],
        loading: true,
        issuesFilter: 'open',
        page: 1
    };

    async componentDidMount() {
        const { match } = this.props;

        const repoName = decodeURIComponent(match.params.repository);

        const [repository, issues] = await Promise.all([
            api.get(`/repos/${repoName}`),
            api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: this.state.issuesFilter,
                    per_page: 30,
                },
            }),
        ]);

        this.setState({
            repository: repository.data,
            issues: issues.data,
            loading: false,
        });

    }

    loadIssues = async () => {
        const { match } = this.props;
        const { issuesFilter, page } = this.state;
        const repoName = decodeURIComponent(match.params.repository);

        const issuesResponse = await api.get(`/repos/${repoName}/issues`, {
            params: {
                state: issuesFilter,
                per_page: 30,
                page,
            },
        });

        this.setState({ issues: issuesResponse.data });
    }

    handleOptionChange = async e => {
        await this.setState({
            issuesFilter: e.target.value
        });

        this.loadIssues();
    }

    async handlePageAction(action) {
        await this.setState({
            page: action === 'back' ? this.state.page - 1 : this.state.page + 1
        });

        this.loadIssues();
    }

    render() {
        const { repository, issues, loading, page } = this.state;

        if (loading) {
            return <Loading > Carregando </Loading>;
        }

        return (
            <Container >
                <Owner >
                    <Link to="/" > Voltar aos repositórios </Link> <img src={repository.owner.avatar_url}
                        alt={repository.owner.login} />
                    <h1 > {repository.name} </h1>
                    <p> {repository.description} </p>

                </Owner>

                <IssueList>
                    <IssueFilter>
                        <label>
                            <input type="radio" value="open"
                                checked={this.state.issuesFilter === 'open'}
                                onChange={this.handleOptionChange} />
                            Issues abertas
                        </label>
                        <label>
                            <input type="radio" value="closed"
                                checked={this.state.issuesFilter === 'closed'}
                                onChange={this.handleOptionChange} />
                            Issues fechadas
                        </label>
                        <label>
                            <input type="radio" value="all"
                                checked={this.state.issuesFilter === 'all'}
                                onChange={this.handleOptionChange} />
                            Todas as Issues
                        </label>
                    </IssueFilter>
                    {issues.map(issue => (<li key={String(issue.id)}>
                        <img src={issue.user.avatar_url}
                            alt={issue.user.login} />
                        <div>
                            <strong>
                                <a href={issue.html_url} > {issue.title} </a> {
                                    issue.labels.map(label => (
                                        <span key={String(label.id)} > {label.name} </span>
                                    ))}
                            </strong> <p > {issue.user.login} </p> </div> </li>))}
                </IssueList>
                <PageActions>
                    <button type="button" onClick={() => this.handlePageAction('back')} disabled={page < 2}>Voltar</button>
                    <span>Página {page}</span>
                    <button type="button" onClick={() => this.handlePageAction('next')}>Próximo</button>
                </PageActions>
            </Container>
        );
    }
}
