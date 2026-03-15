class EligibilityEngine:
    def __init__(self, schemes_data):
        self.schemes = schemes_data
        
    def calculate_score(self, user_profile, scheme):
        """Calculate eligibility score (0-100)"""
        score = 0
        max_score = 0
        
        eligibility = scheme.get('eligibility', {})
        
        # Age check
        if 'age_min' in eligibility and eligibility['age_min']:
            max_score += 20
            if user_profile['age'] >= eligibility['age_min']:
                score += 20
                
        if 'age_max' in eligibility and eligibility['age_max']:
            max_score += 20
            if user_profile['age'] <= eligibility['age_max']:
                score += 20
        
        # Income check
        if 'income_limit' in eligibility and eligibility['income_limit']:
            max_score += 30
            if user_profile['income'] <= eligibility['income_limit']:
                score += 30
        
        # State check
        if 'states' in eligibility:
            max_score += 15
            if 'all' in eligibility['states'] or user_profile['state'] in eligibility['states']:
                score += 15
        
        # Gender check
        if 'gender' in eligibility and eligibility['gender']:
            max_score += 15
            if eligibility['gender'] == user_profile['gender'] or eligibility['gender'] == 'all':
                score += 15
        
        # Normalize score
        if max_score > 0:
            return (score / max_score) * 100
        return 0
    
    def check_eligibility(self, user_profile):
        """Check eligibility for all schemes"""
        results = []
        
        for scheme in self.schemes:
            score = self.calculate_score(user_profile, scheme)
            
            if score >= 50:  # Threshold for eligibility
                results.append({
                    'scheme': scheme,
                    'score': score,
                    'documents': scheme.get('documents_required', [])
                })
        
        # Sort by score
        results.sort(key=lambda x: x['score'], reverse=True)
        return results

if __name__ == "__main__":
    # Test eligibility engine
    print("Eligibility Engine initialized")
